import fs from 'fs';
import path from 'path';

export type LogLevel = 'info' | 'debug' | 'error';
export type ReportFormat = 'jsonl' | 'csv';

export interface UrlEntry {
  line: string;
  originalUrl: string;
  normalizedUrl: string;
  title: string;
  accessedAt?: string;
  tags: string[];
}

export class Logger {
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

export class HostConcurrencyController {
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

export function normalizeUrlForLookup(rawUrl: string): string {
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

export function parseUrlsFile(filePath: string, logger: Logger): UrlEntry[] {
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

export function parseReportFormats(value: string): ReportFormat[] {
  return value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter((item): item is ReportFormat => item === 'jsonl' || item === 'csv');
}

export function collectTags(value: string, previous: string[]): string[] {
  const tags = value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  return Array.from(new Set([...previous, ...tags]));
}
