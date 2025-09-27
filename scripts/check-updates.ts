import 'dotenv/config';

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

type CheckStatus = 'updated' | 'unchanged' | 'not_indexed' | 'failed' | 'multiple_versions';

type CliReportFormat = 'jsonl' | 'csv';

interface CliOptions {
  file: string;
  namespace: string;
  concurrency: number;
  perHost: number;
  timeout: number;
  report: string;
  logLevel: LogLevel;
  reportFile?: string;
  tags: string[];
  ignoreErrors: boolean;
  maxUrls?: number;
}

export interface CheckResult {
  originalUrl: string;
  canonicalUrl: string;
  status: CheckStatus;
  title?: string;
  pineconeHash?: string;
  liveHash?: string;
  pineconeIngestedAt?: string;
  pineconeRecordCount?: number;
  liveEtag?: string | null;
  liveLastModified?: string | null;
  checkedAt: string;
  elapsedMs: number;
  wordCount?: number;
  charCount?: number;
  namespace: string;
  tags: string[];
  error?: string;
}

interface BaselineRecord {
  id: string;
  contentHash?: string;
  ingestedAt?: string;
  etag?: string | null;
  lastModified?: string | null;
  title?: string;
  wordCount?: number;
  charCount?: number;
  metadata: Record<string, unknown>;
}

interface BaselineHashSummary {
  hash: string;
  ingestedAt?: string;
  etag?: string | null;
  lastModified?: string | null;
  title?: string;
  wordCount?: number;
  charCount?: number;
  recordCount: number;
  timestamp?: number;
}

interface BaselineSummary {
  recordCount: number;
  hashes: Map<string, BaselineHashSummary>;
  latest?: BaselineHashSummary;
  uniqueHashes: Set<string>;
}

const SCRIPT_VERSION = 'check-updates@0.1.0';

function buildScraperOptions(options: CliOptions): ScrapeOptions {
  return {
    timeoutMs: options.timeout,
    retryCount: 2,
    retryDelayMs: 750,
    includePdf: true,
    maxPdfPages: 25,
  };
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function pickString(combined: Record<string, any>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = combined[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
}

function extractTimestamp(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

function normaliseMetadata(metadata: Record<string, any> = {}, fields: Record<string, any> = {}): Record<string, any> {
  return { ...fields, ...metadata };
}

function createBaselineRecord(id: string | undefined, data: { metadata?: Record<string, any>; fields?: Record<string, any> }): BaselineRecord | undefined {
  if (!id) {
    return undefined;
  }
  const combined = normaliseMetadata(data.metadata ?? {}, data.fields ?? {});
  const contentHash = pickString(combined, ['contentHash', 'hash', 'vectorHash']);
  const ingestedAt = pickString(combined, ['ingestedAt', 'updatedAt', 'uploadDate', 'dateAdded']);
  const etag = pickString(combined, ['etag', 'ETag']);
  const lastModified = pickString(combined, ['lastModified', 'last_modified', 'lastUpdate']);
  const title = pickString(combined, ['title', 'name']);
  const wordCount = parseNumber(combined.wordCount ?? combined.words ?? combined.tokenCount);
  const charCount = parseNumber(combined.charCount ?? combined.characters ?? combined.length);

  return {
    id,
    contentHash: contentHash ?? undefined,
    ingestedAt,
    etag: etag ?? null,
    lastModified: lastModified ?? null,
    title,
    wordCount,
    charCount,
    metadata: combined,
  };
}

async function fetchBaselineRecords(namespaceClient: any, url: string, logger: Logger): Promise<BaselineRecord[]> {
  if (!url) {
    return [];
  }

  const filter = { url: { $eq: url } };
  const records: BaselineRecord[] = [];

  try {
    if (typeof namespaceClient?.query === 'function') {
      const response = await namespaceClient.query({
        filter,
        topK: 100,
        includeMetadata: true,
      } as any);
      const matches: any[] = Array.isArray(response?.matches) ? response.matches : [];
      matches.forEach((match) => {
        const record = createBaselineRecord(match?.id ?? match?.vectorId, { metadata: match?.metadata });
        if (record) {
          records.push(record);
        }
      });
      return records;
    }

    if (typeof namespaceClient?.searchRecords === 'function') {
      const response = await namespaceClient.searchRecords({
        query: { topK: 100, inputs: { text: url } },
        includeMetadata: true,
        filter,
      });
      const hits: any[] = Array.isArray(response?.hits) ? response.hits : [];
      hits.forEach((hit) => {
        const record = createBaselineRecord(hit?.id ?? hit?.vectorId, { metadata: hit?.metadata, fields: hit?.fields });
        if (record) {
          records.push(record);
        }
      });
      return records;
    }

    if (typeof namespaceClient?.listRecords === 'function') {
      const response = await namespaceClient.listRecords({ filter, limit: 200 });
      const data = response?.records ?? response?.vectors ?? {};
      Object.entries(data).forEach(([id, entry]) => {
        const record = createBaselineRecord(id, { metadata: (entry as any)?.metadata, fields: (entry as any)?.fields });
        if (record) {
          records.push(record);
        }
      });
      return records;
    }

    logger.debug('Namespace client does not expose a supported query method; returning empty baseline.');
    return [];
  } catch (error) {
    throw new Error(`Pinecone baseline query failed for ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function summariseBaseline(records: BaselineRecord[]): BaselineSummary {
  const hashes = new Map<string, BaselineHashSummary>();
  const uniqueHashes = new Set<string>();

  for (const record of records) {
    const key = record.contentHash ?? '__missing__';
    const timestamp = extractTimestamp(record.ingestedAt);
    const existing = hashes.get(key);

    if (record.contentHash && record.contentHash.trim().length > 0) {
      uniqueHashes.add(record.contentHash);
    }

    if (existing) {
      existing.recordCount += 1;
      if ((timestamp ?? -Infinity) > (existing.timestamp ?? -Infinity)) {
        existing.ingestedAt = record.ingestedAt;
        existing.etag = record.etag;
        existing.lastModified = record.lastModified;
        existing.title = record.title ?? existing.title;
        existing.wordCount = record.wordCount ?? existing.wordCount;
        existing.charCount = record.charCount ?? existing.charCount;
        existing.timestamp = timestamp;
      }
      continue;
    }

    hashes.set(key, {
      hash: record.contentHash ?? '',
      ingestedAt: record.ingestedAt,
      etag: record.etag ?? null,
      lastModified: record.lastModified ?? null,
      title: record.title,
      wordCount: record.wordCount,
      charCount: record.charCount,
      recordCount: 1,
      timestamp,
    });
  }

  let latest: BaselineHashSummary | undefined;
  for (const summary of hashes.values()) {
    if (!latest || (summary.timestamp ?? -Infinity) > (latest.timestamp ?? -Infinity)) {
      latest = summary;
    }
  }

  return {
    recordCount: records.length,
    hashes,
    latest,
    uniqueHashes,
  };
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return typeof error === 'string' ? error : JSON.stringify(error);
}

function mergeBaseline(target: Map<string, BaselineRecord>, additions: BaselineRecord[]) {
  for (const record of additions) {
    target.set(record.id, record);
  }
}

async function checkUrl(
  entry: UrlEntry,
  options: CliOptions,
  logger: Logger,
  namespaceClient: any,
  hostLimiter: HostConcurrencyController,
): Promise<CheckResult> {
  const start = Date.now();
  const baselineRecords = new Map<string, BaselineRecord>();

  try {
    const initialRecords = await fetchBaselineRecords(namespaceClient, entry.normalizedUrl, logger);
    mergeBaseline(baselineRecords, initialRecords);
  } catch (error) {
    return {
      originalUrl: entry.originalUrl,
      canonicalUrl: entry.normalizedUrl,
      status: 'failed',
      checkedAt: new Date().toISOString(),
      elapsedMs: Date.now() - start,
      namespace: options.namespace,
      tags: options.tags,
      error: formatError(error),
    };
  }

  const host = (() => {
    try {
      return new URL(entry.originalUrl).hostname;
    } catch {
      return 'unknown-host';
    }
  })();

  const release = await hostLimiter.acquire(host);

  try {
    const scrape = await WebScraper.scrapeUrl(entry.originalUrl, buildScraperOptions(options));
    const canonicalUrl = normalizeUrlForLookup(scrape.metadata.canonicalUrl ?? scrape.url ?? entry.originalUrl);

    if (canonicalUrl !== entry.normalizedUrl) {
      try {
        const canonicalRecords = await fetchBaselineRecords(namespaceClient, canonicalUrl, logger);
        mergeBaseline(baselineRecords, canonicalRecords);
      } catch (error) {
        logger.debug(`Failed to fetch baseline for canonical URL ${canonicalUrl}: ${formatError(error)}`);
      }
    }

    const baselineSummary = summariseBaseline(Array.from(baselineRecords.values()));
    const normalizedContent = DocumentProcessor.normalizeContent(scrape.content);
    const liveHash = DocumentProcessor.generateContentHash(normalizedContent);
    const wordCount = normalizedContent.split(/\s+/).filter(Boolean).length;
    const charCount = normalizedContent.length;

    const uniqueHashes = Array.from(baselineSummary.uniqueHashes);
    const multipleVersions = uniqueHashes.length > 1;
    const pineconeHash = baselineSummary.latest?.hash || uniqueHashes[0];

    let status: CheckStatus;
    if (baselineSummary.recordCount === 0) {
      status = 'not_indexed';
    } else if (multipleVersions) {
      status = 'multiple_versions';
    } else if (pineconeHash && pineconeHash === liveHash) {
      status = 'unchanged';
    } else {
      status = 'updated';
    }

    return {
      originalUrl: entry.originalUrl,
      canonicalUrl,
      status,
      title: scrape.title ?? baselineSummary.latest?.title ?? entry.title,
      pineconeHash: pineconeHash || undefined,
      liveHash,
      pineconeIngestedAt: baselineSummary.latest?.ingestedAt,
      pineconeRecordCount: baselineSummary.recordCount,
      liveEtag: scrape.metadata.etag ?? null,
      liveLastModified: scrape.metadata.lastModified ?? null,
      checkedAt: new Date().toISOString(),
      elapsedMs: Date.now() - start,
      wordCount,
      charCount,
      namespace: options.namespace,
      tags: options.tags,
    };
  } catch (error) {
    return {
      originalUrl: entry.originalUrl,
      canonicalUrl: entry.normalizedUrl,
      status: 'failed',
      checkedAt: new Date().toISOString(),
      elapsedMs: Date.now() - start,
      namespace: options.namespace,
      tags: options.tags,
      error: formatError(error),
    };
  } finally {
    release();
  }
}

async function main() {
  const program = new Command();
  program
    .name('check-updates')
    .description('Compare live URLs against Pinecone baseline hashes')
    .option('--file <path>', 'Input file of URLs', 'info/urls.md')
    .option('--namespace <name>', 'Pinecone namespace to check', 'urls')
    .option('--concurrency <number>', 'Global concurrency', (value) => Number.parseInt(value, 10), 3)
    .option('--per-host <number>', 'Per-host concurrency limit', (value) => Number.parseInt(value, 10), 2)
    .option('--timeout <ms>', 'Request timeout in milliseconds', (value) => Number.parseInt(value, 10), 15_000)
    .option('--report <formats>', 'Report formats (jsonl|csv|none)', 'jsonl')
    .option('--log-level <level>', 'Log level (info|debug)', 'info')
    .option('--report-file <path>', 'Custom report output path')
    .option('--tag <value>', 'Attach metadata tags (comma-separated or repeat flag)', collectTags, [])
    .option('--ignore-errors', 'Exit with code 0 even if failures occur', false)
    .option('--max-urls <number>', 'Limit number of URLs processed', (value) => Number.parseInt(value, 10))
    .parse(process.argv);

  const opts = program.opts();
  const options: CliOptions = {
    file: opts.file,
    namespace: opts.namespace,
    concurrency: opts.concurrency,
    perHost: opts.perHost,
    timeout: opts.timeout,
    report: opts.report,
    logLevel: (opts.logLevel ?? 'info') as LogLevel,
    reportFile: opts.reportFile,
    tags: opts.tag ?? [],
    ignoreErrors: Boolean(opts.ignoreErrors),
    maxUrls: Number.isFinite(opts.maxUrls) ? opts.maxUrls : undefined,
  };

  const logger = new Logger(options.logLevel);
  const formats = options.report === 'none' ? [] : (parseReportFormats(options.report) as CliReportFormat[]);
  const reporter = new Reporter<CheckResult>({
    formats,
    version: SCRIPT_VERSION,
    filePrefix: 'check-updates',
    basePath: options.reportFile,
    summaryStatuses: ['updated', 'unchanged', 'not_indexed', 'failed', 'multiple_versions'],
    csvHeaders: [
      'originalUrl',
      'canonicalUrl',
      'status',
      'title',
      'pineconeHash',
      'liveHash',
      'pineconeIngestedAt',
      'pineconeRecordCount',
      'liveEtag',
      'liveLastModified',
      'checkedAt',
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
      record.canonicalUrl,
      record.status,
      record.title ?? '',
      record.pineconeHash ?? '',
      record.liveHash ?? '',
      record.pineconeIngestedAt ?? '',
      record.pineconeRecordCount ?? 0,
      record.liveEtag ?? '',
      record.liveLastModified ?? '',
      record.checkedAt,
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
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY is required to query Pinecone.');
    }

    const entries = parseUrlsFile(options.file, logger);
    const limitedEntries = options.maxUrls ? entries.slice(0, options.maxUrls) : entries;
    logger.info(`Prepared ${limitedEntries.length} URLs for update checks`);

    const namespaceClient = pineconeService.namespace(options.namespace);
    const hostLimiter = new HostConcurrencyController(options.perHost);

    const results = await pMap(
      limitedEntries,
      (entry) => checkUrl(entry, options, logger, namespaceClient, hostLimiter),
      { concurrency: options.concurrency },
    );

    for (const result of results) {
      reporter.record(result);
      const statusIcon =
        result.status === 'failed'
          ? '✖'
          : result.status === 'updated'
            ? '✱'
            : result.status === 'multiple_versions'
              ? '‼'
              : result.status === 'not_indexed'
                ? '∅'
                : '⟲';
      const summary = `${statusIcon} [${result.status.padEnd(16)}] ${result.originalUrl}`;
      logger.info(summary);
      if (result.error) {
        logger.error(`  → ${result.error}`);
      }
    }

    const totals = reporter.summary();
    logger.info('--- Summary ---');
    logger.info(`Processed: ${totals.total ?? 0}`);
    logger.info(`Updated: ${totals.updated ?? 0}, Unchanged: ${totals.unchanged ?? 0}`);
    logger.info(`Not indexed: ${totals.not_indexed ?? 0}, Multiple versions: ${totals.multiple_versions ?? 0}`);
    logger.info(`Failed: ${totals.failed ?? 0}`);

    reporter.close();

    if ((totals.failed ?? 0) > 0 && !options.ignoreErrors) {
      process.exitCode = 1;
    }
  } catch (error) {
    reporter.close();
    logger.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exitCode = 1;
  }
}

main();
