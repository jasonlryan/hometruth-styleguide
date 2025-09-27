import 'dotenv/config';

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Command } from 'commander';
import pMap from 'p-map';

import { WebScraper, ScrapeOptions } from '../lib/scraper';
import { DocumentProcessor } from '../lib/document-processor';
import { pineconeService } from '../lib/pinecone';
import {
  Logger,
  HostConcurrencyController,
  parseUrlsFile,
  parseReportFormats,
  collectTags,
  normalizeUrlForLookup,
  LogLevel,
  UrlEntry,
} from './utils/common';
import { Reporter } from './utils/reporter';

interface CliOptions {
  file: string;
  namespace: string;
  concurrency: number;
  perHost: number;
  timeout: number;
  includePdf: boolean;
  update: boolean;
  dryRun: boolean;
  maxUrls?: number;
  report: string;
  logLevel: LogLevel;
  resumeFrom?: string;
  reportFile?: string;
  tags: string[];
  ignoreErrors: boolean;
}

interface ResumeRecord {
  originalUrl?: string;
  canonicalUrl?: string;
  contentHash?: string;
  status?: string;
  vectorIds?: string[];
  updatedAt?: string;
}

interface IngestionResult {
  status: 'new' | 'updated' | 'unchanged' | 'skipped' | 'duplicate' | 'failed';
  originalUrl: string;
  canonicalUrl?: string;
  title?: string;
  contentHash?: string;
  chunkCount?: number;
  vectorIds?: string[];
  accessedAt?: string;
  ingestedAt?: string;
  etag?: string | null;
  lastModified?: string | null;
  elapsedMs: number;
  wordCount?: number;
  charCount?: number;
  error?: string;
  reason?: string;
  namespace: string;
  tags: string[];
}

const SCRIPT_VERSION = 'ingest-urls@0.1.0';

function loadResumeFile(filePath: string | undefined, logger: Logger): Map<string, ResumeRecord> {
  if (!filePath) {
    return new Map();
  }

  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Resume file not found: ${resolved}`);
  }

  logger.info(`Resuming from ${resolved}`);
  const entries = fs.readFileSync(resolved, 'utf8').split(/\r?\n/).filter(Boolean);
  const map = new Map<string, ResumeRecord>();

  for (const line of entries) {
    try {
      const parsed = JSON.parse(line) as ResumeRecord;
      const { originalUrl, canonicalUrl } = parsed;
      if (originalUrl) {
        map.set(normalizeUrlForLookup(originalUrl), parsed);
      }
      if (canonicalUrl) {
        map.set(normalizeUrlForLookup(canonicalUrl), parsed);
      }
    } catch (error) {
      logger.debug(`Failed to parse resume line: ${String(error)}`);
    }
  }

  return map;
}

function buildScraperOptions(options: CliOptions): ScrapeOptions {
  return {
    timeoutMs: options.timeout,
    retryCount: 2,
    retryDelayMs: 750,
    includePdf: options.includePdf,
    maxPdfPages: 25,
  };
}

async function ingestUrl(
  entry: UrlEntry,
  options: CliOptions,
  resumeIndex: Map<string, ResumeRecord>,
  logger: Logger,
  hostLimiter: HostConcurrencyController,
  processedCanonical: Set<string>,
): Promise<IngestionResult> {
  const start = Date.now();
  const host = (() => {
    try {
      return new URL(entry.originalUrl).hostname;
    } catch {
      return 'unknown';
    }
  })();

  const release = await hostLimiter.acquire(host);

  try {
    const resumeRecord = resumeIndex.get(entry.normalizedUrl);
    if (resumeRecord && resumeRecord.status && ['updated', 'unchanged'].includes(resumeRecord.status)) {
      return {
        status: 'skipped',
        originalUrl: entry.originalUrl,
        canonicalUrl: resumeRecord.canonicalUrl ?? entry.normalizedUrl,
        title: entry.title,
        contentHash: resumeRecord.contentHash,
        chunkCount: resumeRecord.vectorIds?.length,
        vectorIds: resumeRecord.vectorIds,
        accessedAt: entry.accessedAt,
        ingestedAt: resumeRecord.updatedAt,
        elapsedMs: Date.now() - start,
        reason: 'resume-skip',
        namespace: options.namespace,
        tags: options.tags,
      };
    }

    logger.debug(`Fetching ${entry.originalUrl}`);
    const scrape = await WebScraper.scrapeUrl(entry.originalUrl, buildScraperOptions(options));
    const canonicalUrl = normalizeUrlForLookup(scrape.metadata.canonicalUrl ?? scrape.url ?? entry.originalUrl);

    if (processedCanonical.has(canonicalUrl)) {
      return {
        status: 'duplicate',
        originalUrl: entry.originalUrl,
        canonicalUrl,
        title: scrape.title,
        elapsedMs: Date.now() - start,
        reason: 'already-processed',
        namespace: options.namespace,
        tags: options.tags,
      };
    }
    processedCanonical.add(canonicalUrl);

    const normalizedContent = DocumentProcessor.normalizeContent(scrape.content);
    const contentHash = DocumentProcessor.generateContentHash(normalizedContent);
    const resumeForCanonical = resumeIndex.get(canonicalUrl);
    const previousHash = resumeForCanonical?.contentHash ?? resumeRecord?.contentHash;
    const changed = DocumentProcessor.hasContentChanged(previousHash, contentHash);
    const status: IngestionResult['status'] = changed ? (previousHash ? 'updated' : 'new') : 'unchanged';

    if (!changed && !options.update) {
      return {
        status: 'unchanged',
        originalUrl: entry.originalUrl,
        canonicalUrl,
        title: scrape.title,
        contentHash,
        chunkCount: 0,
        vectorIds: [],
        accessedAt: entry.accessedAt,
        ingestedAt: new Date().toISOString(),
        etag: scrape.metadata.etag ?? null,
        lastModified: scrape.metadata.lastModified ?? null,
        elapsedMs: Date.now() - start,
        wordCount: normalizedContent.split(/\s+/).filter(Boolean).length,
        charCount: normalizedContent.length,
        reason: 'content-unchanged',
        namespace: options.namespace,
        tags: options.tags,
      };
    }

    const chunks = DocumentProcessor.chunkTextByTokens(normalizedContent, {
      targetTokens: 1000,
      overlapTokens: 120,
    });

    if (chunks.length === 0) {
      return {
        status: 'skipped',
        originalUrl: entry.originalUrl,
        canonicalUrl,
        title: scrape.title,
        contentHash,
        chunkCount: 0,
        vectorIds: [],
        accessedAt: entry.accessedAt,
        ingestedAt: new Date().toISOString(),
        etag: scrape.metadata.etag ?? null,
        lastModified: scrape.metadata.lastModified ?? null,
        elapsedMs: Date.now() - start,
        reason: 'empty-content',
        namespace: options.namespace,
        tags: options.tags,
      };
    }

    const ingestedAt = new Date().toISOString();
    const vectorIds: string[] = [];
    const documentId = crypto.createHash('sha256').update(`${canonicalUrl}|${contentHash}`).digest('hex');
    const chunkMetadata = chunks.map((chunk, index) => {
      const chunkId = DocumentProcessor.createDeterministicChunkId({
        url: canonicalUrl,
        contentHash,
        chunkIndex: index,
      });
      vectorIds.push(chunkId);

      const chunkWordCount = chunk.trim().split(/\s+/).filter(Boolean).length;

      return {
        id: chunkId,
        chunk_text: chunk,
        metadata: {
          id: documentId,
          name: scrape.title,
          type: scrape.metadata.contentType ?? 'text/html',
          dateAdded: ingestedAt,
          source: scrape.metadata.domain,
          tags: options.tags,
          status: status,
          documentId,
          url: canonicalUrl,
          originalUrl: entry.originalUrl,
          title: scrape.title,
          contentType: scrape.metadata.contentType ?? 'text/html',
          chunkIndex: index,
          chunkCount: chunks.length,
          hash: contentHash,
          contentHash,
          wordCount: chunkWordCount,
          charCount: chunk.length,
          accessedAt: entry.accessedAt,
          ingestedAt,
          version: SCRIPT_VERSION,
          namespace: options.namespace,
          etag: scrape.metadata.etag ?? undefined,
          lastModified: scrape.metadata.lastModified ?? undefined,
        },
      };
    });

    if (!options.dryRun) {
      await pineconeService.upsertKnowledgeContent(chunkMetadata as any, options.namespace);
    }

    const elapsedMs = Date.now() - start;
    return {
      status,
      originalUrl: entry.originalUrl,
      canonicalUrl,
      title: scrape.title,
      contentHash,
      chunkCount: chunks.length,
      vectorIds,
      accessedAt: entry.accessedAt,
      ingestedAt,
      etag: scrape.metadata.etag ?? null,
      lastModified: scrape.metadata.lastModified ?? null,
      elapsedMs,
      wordCount: normalizedContent.split(/\s+/).filter(Boolean).length,
      charCount: normalizedContent.length,
      namespace: options.namespace,
      tags: options.tags,
    };
  } catch (error) {
    const elapsedMs = Date.now() - start;
    return {
      status: 'failed',
      originalUrl: entry.originalUrl,
      canonicalUrl: entry.normalizedUrl,
      title: entry.title,
      elapsedMs,
      error: error instanceof Error ? error.message : String(error),
      namespace: options.namespace,
      tags: options.tags,
    };
  } finally {
    release();
  }
}

async function main() {
  const program = new Command();
  program
    .name('ingest-urls')
    .description('Fetch URLs, create embeddings, and upsert into Pinecone')
    .option('--file <path>', 'Input file of URLs', 'info/urls.md')
    .option('--namespace <name>', 'Pinecone namespace', 'urls')
    .option('--concurrency <number>', 'Global concurrency', (value) => Number.parseInt(value, 10), 3)
    .option('--per-host <number>', 'Per-host concurrency limit', (value) => Number.parseInt(value, 10), 2)
    .option('--timeout <ms>', 'Request timeout in milliseconds', (value) => Number.parseInt(value, 10), 15_000)
    .option('--update', 'Force re-embed even if unchanged', false)
    .option('--dry-run', 'Do everything except the Pinecone upsert', false)
    .option('--max-urls <number>', 'Limit number of URLs processed', (value) => Number.parseInt(value, 10))
    .option('--report <formats>', 'Report formats (jsonl|csv|none)', 'jsonl')
    .option('--log-level <level>', 'Log level (info|debug)', 'info')
    .option('--resume-from <path>', 'Resume from previous report')
    .option('--report-file <path>', 'Explicit report output path')
    .option('--tag <value>', 'Attach metadata tags (comma-separated or repeat flag)', collectTags, [])
    .option('--ignore-errors', 'Exit with code 0 even if failures occur', false)
    .option('--no-include-pdf', 'Skip PDF ingestion')
    .parse(process.argv);

  const opts = program.opts();
  const options: CliOptions = {
    file: opts.file,
    namespace: opts.namespace,
    concurrency: opts.concurrency,
    perHost: opts.perHost,
    timeout: opts.timeout,
    includePdf: opts.includePdf ?? true,
    update: Boolean(opts.update),
    dryRun: Boolean(opts.dryRun),
    maxUrls: Number.isFinite(opts.maxUrls) ? opts.maxUrls : undefined,
    report: opts.report,
    logLevel: (opts.logLevel ?? 'info') as LogLevel,
    resumeFrom: opts.resumeFrom,
    reportFile: opts.reportFile,
    tags: opts.tag ?? [],
    ignoreErrors: Boolean(opts.ignoreErrors),
  };

  const logger = new Logger(options.logLevel);
  const formats = options.report === 'none' ? [] : parseReportFormats(options.report);
  const reporter = new Reporter<IngestionResult>({
    formats,
    version: SCRIPT_VERSION,
    filePrefix: 'ingest-urls',
    basePath: options.reportFile,
    summaryStatuses: ['new', 'updated', 'unchanged', 'skipped', 'duplicate', 'failed'],
    csvHeaders: [
      'originalUrl',
      'canonicalUrl',
      'status',
      'title',
      'contentHash',
      'chunkCount',
      'vectorIds',
      'accessedAt',
      'ingestedAt',
      'etag',
      'lastModified',
      'elapsedMs',
      'wordCount',
      'charCount',
      'namespace',
      'tags',
      'error',
      'reportVersion',
    ],
    csvRow: (record) => [
      record.originalUrl,
      record.canonicalUrl ?? '',
      record.status,
      record.title ?? '',
      record.contentHash ?? '',
      record.chunkCount ?? '',
      (record.vectorIds ?? []).join('|'),
      record.accessedAt ?? '',
      record.ingestedAt ?? '',
      record.etag ?? '',
      record.lastModified ?? '',
      record.elapsedMs,
      record.wordCount ?? '',
      record.charCount ?? '',
      record.namespace,
      record.tags.join('|'),
      record.error ?? '',
      record.reportVersion,
    ],
  });

  try {
    if (!options.dryRun && !process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY is required unless running with --dry-run');
    }

    const entries = parseUrlsFile(options.file, logger);
    const limitedEntries = options.maxUrls ? entries.slice(0, options.maxUrls) : entries;
    logger.info(`Prepared ${limitedEntries.length} URLs for ingestion`);

    const resumeIndex = loadResumeFile(options.resumeFrom, logger);
    const hostLimiter = new HostConcurrencyController(options.perHost);
    const processedCanonical = new Set<string>();

    const scraperOptions = buildScraperOptions(options);
    logger.debug(`Scraper options: ${JSON.stringify(scraperOptions)}`);

    const results = await pMap(
      limitedEntries,
      (entry) => ingestUrl(entry, options, resumeIndex, logger, hostLimiter, processedCanonical),
      { concurrency: options.concurrency },
    );

    for (const result of results) {
      reporter.record(result);
      const statusIcon =
        result.status === 'failed'
          ? '✖'
          : result.status === 'updated'
            ? '✱'
            : result.status === 'new'
              ? '➕'
              : result.status === 'unchanged'
                ? '⟲'
                : result.status === 'duplicate'
                  ? '≡'
                  : '‒';
      const summary = `${statusIcon} [${result.status.padEnd(9)}] ${result.originalUrl}`;
      logger.info(summary);
      if (result.error) {
        logger.error(`  → ${result.error}`);
      }
    }

    const totals = reporter.summary();
    logger.info('--- Summary ---');
    logger.info(`Processed: ${totals.total ?? 0}`);
    logger.info(
      `New: ${totals.new ?? 0}, Updated: ${totals.updated ?? 0}, Unchanged: ${totals.unchanged ?? 0}`,
    );
    logger.info(`Skipped: ${totals.skipped ?? 0}, Duplicates: ${totals.duplicate ?? 0}`);
    logger.info(`Failed: ${totals.failed ?? 0}`);

    reporter.close();

    if (totals.failed > 0 && !options.ignoreErrors) {
      process.exitCode = 1;
    }
  } catch (error) {
    reporter.close();
    logger.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exitCode = 1;
  }
}

main();
