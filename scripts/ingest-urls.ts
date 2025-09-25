import 'dotenv/config';

import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { Command } from 'commander';
import pMap from 'p-map';

import { WebScraper, ScrapeOptions } from '../lib/scraper';
import { DocumentProcessor } from '../lib/document-processor';
import { pineconeService } from '../lib/pinecone';

type LogLevel = 'info' | 'debug' | 'error';
type ReportFormat = 'jsonl' | 'csv';

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

interface UrlEntry {
  line: string;
  originalUrl: string;
  normalizedUrl: string;
  title: string;
  accessedAt?: string;
  tags: string[];
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

interface ReportRecord extends IngestionResult {
  reportVersion: string;
  metadata?: Record<string, unknown>;
}

const SCRIPT_VERSION = 'ingest-urls@0.1.0';

class Logger {
  constructor(private level: LogLevel) {}

  info(message: string) {
    if (this.level === 'info' || this.level === 'debug') {
      console.log(message);
    }
  }

  debug(message: string) {
    if (this.level === 'debug') {
      console.debug(message);
    }
  }

  error(message: string) {
    console.error(message);
  }
}

class HostConcurrencyController {
  private active = new Map<string, number>();
  private queues = new Map<string, Array<() => void>>();

  constructor(private limit: number) {}

  async acquire(host: string): Promise<() => void> {
    return new Promise((resolve) => {
      const normalizedHost = host.toLowerCase();
      const current = this.active.get(normalizedHost) ?? 0;

      if (current < this.limit) {
        this.active.set(normalizedHost, current + 1);
        resolve(() => this.release(normalizedHost));
        return;
      }

      const queue = this.queues.get(normalizedHost) ?? [];
      queue.push(() => {
        const nextCount = this.active.get(normalizedHost) ?? 0;
        this.active.set(normalizedHost, nextCount + 1);
        resolve(() => this.release(normalizedHost));
      });
      this.queues.set(normalizedHost, queue);
    });
  }

  private release(host: string) {
    const current = this.active.get(host) ?? 0;
    if (current <= 1) {
      this.active.delete(host);
    } else {
      this.active.set(host, current - 1);
    }

    const queue = this.queues.get(host);
    if (queue && queue.length > 0) {
      const next = queue.shift();
      if (next) {
        setTimeout(next, 50 + Math.random() * 100);
      }
    }
  }
}

class Reporter {
  private readonly targets: Set<ReportFormat>;
  private jsonlStream?: fs.WriteStream;
  private csvStream?: fs.WriteStream;
  private readonly records: ReportRecord[] = [];

  constructor(formats: ReportFormat[], basePath?: string) {
    this.targets = new Set(formats);
    if (this.targets.size === 0) {
      return;
    }

    const reportDir = basePath ? path.dirname(basePath) : path.resolve(process.cwd(), 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const baseName = basePath
      ? path.basename(basePath, path.extname(basePath))
      : `ingest-urls-${new Date().toISOString().replace(/[:.]/g, '-')}`;

    if (this.targets.has('jsonl')) {
      const jsonlPath = basePath && this.targets.size === 1 && basePath.endsWith('.jsonl')
        ? basePath
        : path.join(reportDir, `${baseName}.jsonl`);
      this.jsonlStream = fs.createWriteStream(jsonlPath, { flags: 'a' });
      this.jsonlStream.write(`{"reportVersion":"${SCRIPT_VERSION}","startedAt":"${new Date().toISOString()}"}${os.EOL}`);
    }

    if (this.targets.has('csv')) {
      const csvPath = basePath && this.targets.size === 1 && basePath.endsWith('.csv')
        ? basePath
        : path.join(reportDir, `${baseName}.csv`);
      const exists = fs.existsSync(csvPath);
      this.csvStream = fs.createWriteStream(csvPath, { flags: 'a' });
      if (!exists) {
        this.csvStream.write(
          'originalUrl,canonicalUrl,status,title,contentHash,chunkCount,vectorIds,accessedAt,ingestedAt,etag,lastModified,elapsedMs,wordCount,charCount,namespace,tags,error,reportVersion' +
            os.EOL,
        );
      }
    }
  }

  record(entry: IngestionResult, metadata?: Record<string, unknown>) {
    const report: ReportRecord = {
      ...entry,
      reportVersion: SCRIPT_VERSION,
      metadata,
    };
    this.records.push(report);

    if (this.jsonlStream) {
      this.jsonlStream.write(`${JSON.stringify(report)}${os.EOL}`);
    }

    if (this.csvStream) {
      const vectorIds = report.vectorIds?.join('|') ?? '';
      const tags = report.tags.join('|');
      const csvRow = [
        report.originalUrl,
        report.canonicalUrl ?? '',
        report.status,
        (report.title ?? '').replace(/"/g, '""'),
        report.contentHash ?? '',
        report.chunkCount ?? '',
        vectorIds.replace(/"/g, '""'),
        report.accessedAt ?? '',
        report.ingestedAt ?? '',
        report.etag ?? '',
        report.lastModified ?? '',
        report.elapsedMs,
        report.wordCount ?? '',
        report.charCount ?? '',
        report.namespace,
        tags.replace(/"/g, '""'),
        report.error ? report.error.replace(/"/g, '""') : '',
        report.reportVersion,
      ]
        .map((value) => (typeof value === 'string' ? `"${value}"` : String(value)))
        .join(',');
      this.csvStream.write(`${csvRow}${os.EOL}`);
    }
  }

  summary() {
    const totals = {
      total: this.records.length,
      new: 0,
      updated: 0,
      unchanged: 0,
      skipped: 0,
      duplicate: 0,
      failed: 0,
    };

    for (const record of this.records) {
      if (record.status in totals) {
        // @ts-expect-error indexed intentionally
        totals[record.status] += 1;
      }
    }

    return totals;
  }

  close() {
    this.jsonlStream?.end();
    this.csvStream?.end();
  }

  getRecords() {
    return this.records;
  }
}

function normalizeUrlForLookup(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    url.hash = '';
    const params = url.searchParams;
    const keysToRemove: string[] = [];
    params.forEach((_, key) => {
      const lower = key.toLowerCase();
      if (lower.startsWith('utm_') || lower === 'fbclid') {
        keysToRemove.push(key);
      }
    });
    keysToRemove.forEach((key) => params.delete(key));
    url.search = params.toString();
    if (url.pathname !== '/' && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

function parseUrlsFile(filePath: string, logger: Logger): UrlEntry[] {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Input file not found: ${resolved}`);
  }

  const content = fs.readFileSync(resolved, 'utf8');
  const lines = content.split(/\r?\n/);
  const results: UrlEntry[] = [];
  const seen = new Set<string>();

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const match = line.match(/^(.*?),\s*accessed\s+(.+),\s*(https?:\/\/\S+)/i);
    if (!match) {
      logger.debug(`Skipping unrecognised line: ${line}`);
      continue;
    }

    const [, titlePart, accessed, url] = match;
    const normalizedUrl = normalizeUrlForLookup(url);
    if (seen.has(normalizedUrl)) {
      logger.debug(`Duplicate URL skipped in source file: ${normalizedUrl}`);
      continue;
    }

    seen.add(normalizedUrl);
    results.push({
      line,
      originalUrl: url,
      normalizedUrl,
      title: titlePart.trim(),
      accessedAt: accessed.trim(),
      tags: [],
    });
  }

  return results;
}

function parseReportFormats(value: string): ReportFormat[] {
  return value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter((item): item is ReportFormat => item === 'jsonl' || item === 'csv');
}

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

function collectTags(value: string, previous: string[]): string[] {
  const tags = value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  return Array.from(new Set([...previous, ...tags]));
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
  const reporter = new Reporter(formats, options.reportFile);

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
    logger.info(`Processed: ${totals.total}`);
    logger.info(`New: ${totals.new}, Updated: ${totals.updated}, Unchanged: ${totals.unchanged}`);
    logger.info(`Skipped: ${totals.skipped}, Duplicates: ${totals.duplicate}`);
    logger.info(`Failed: ${totals.failed}`);

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
