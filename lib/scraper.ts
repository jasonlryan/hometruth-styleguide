import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import pdfParse from 'pdf-parse';

export interface ScrapedContent {
  title: string;
  content: string;
  url: string;
  metadata: {
    description?: string;
    author?: string;
    publishedDate?: string;
    domain: string;
    wordCount: number;
    contentType?: string;
    canonicalUrl?: string;
    originalUrl?: string;
    statusCode?: number;
    etag?: string | null;
    lastModified?: string | null;
    fetchedAt?: string;
  };
}

export interface ScrapeOptions {
  timeoutMs?: number;
  retryCount?: number;
  retryDelayMs?: number;
  includePdf?: boolean;
  maxPdfPages?: number;
  maxContentLength?: number;
  userAgent?: string;
}

interface FetchResult {
  responseBody: Buffer;
  finalUrl: string;
  statusCode: number;
  headers: Record<string, string>;
}

export class WebScraper {
  static async scrapeUrl(url: string, options: ScrapeOptions = {}): Promise<ScrapedContent> {
    if (!this.isValidUrl(url)) {
      throw new Error('Invalid URL provided');
    }

    const {
      includePdf = true,
      timeoutMs = 15_000,
      retryCount = 2,
      retryDelayMs = 750,
      maxPdfPages = 30,
      maxContentLength = 5 * 1024 * 1024,
      userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'
    } = options;

    const fetchResult = await this.fetchWithRetry(url, {
      timeoutMs,
      retryCount,
      retryDelayMs,
      maxContentLength,
      userAgent,
    });

    const { headers, responseBody, finalUrl, statusCode } = fetchResult;
    const contentType = headers['content-type']?.split(';')[0].trim().toLowerCase() ?? 'text/html';
    const etag = headers['etag'] ?? null;
    const lastModified = headers['last-modified'] ?? null;
    const fetchedAt = new Date().toISOString();

    if (contentType === 'application/pdf') {
      if (!includePdf) {
        throw new Error('PDF content skipped by configuration');
      }

      const text = await this.extractPdfText(responseBody, maxPdfPages);
      const title = this.deriveTitleFromPdf(finalUrl);
      const domain = this.getDomain(finalUrl);
      const cleanedContent = this.normalizeWhitespace(text);

      return {
        title,
        content: cleanedContent,
        url: finalUrl,
        metadata: {
          domain,
          wordCount: this.countWords(cleanedContent),
          contentType: 'application/pdf',
          canonicalUrl: finalUrl,
          originalUrl: url,
          statusCode,
          etag,
          lastModified,
          fetchedAt,
        },
      };
    }

    const html = responseBody.toString('utf-8');
    const dom = new JSDOM(html, { url: finalUrl });
    const { document } = dom.window;

    const canonicalHref = this.extractCanonicalUrl(document);
    const canonicalUrl = canonicalHref ? this.canonicalizeUrl(canonicalHref) : this.canonicalizeUrl(finalUrl);

    const readability = new Readability(document);
    const article = readability.parse();

    const title = article?.title?.trim() || document.title?.trim() || this.fallbackTitleFromUrl(finalUrl);
    const content = article?.textContent?.trim() || this.extractBodyText(document);
    const cleanedContent = this.normalizeWhitespace(content);
    const description = article?.excerpt?.trim() || this.extractMetaContent(document, 'description');
    const author = this.extractAuthor(document);
    const publishedDate = this.extractPublicationDate(document);

    return {
      title,
      content: cleanedContent,
      url: canonicalUrl,
      metadata: {
        description,
        author,
        publishedDate,
        domain: this.getDomain(canonicalUrl),
        wordCount: this.countWords(cleanedContent),
        contentType: contentType || 'text/html',
        canonicalUrl,
        originalUrl: url,
        statusCode,
        etag,
        lastModified,
        fetchedAt,
      },
    };
  }

  static isValidUrl(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  private static async fetchWithRetry(url: string, options: {
    timeoutMs: number;
    retryCount: number;
    retryDelayMs: number;
    maxContentLength: number;
    userAgent: string;
  }): Promise<FetchResult> {
    const { retryCount, retryDelayMs } = options;
    let attempt = 0;
    let lastError: unknown;

    while (attempt <= retryCount) {
      try {
        return await this.fetchOnce(url, options);
      } catch (error) {
        lastError = error;
        if (attempt === retryCount) {
          break;
        }

        const baseDelay = retryDelayMs * Math.pow(2, attempt);
        const jitter = Math.random() * 200;
        await new Promise((resolve) => setTimeout(resolve, baseDelay + jitter));
      }
      attempt += 1;
    }

    throw new Error(`Failed to fetch URL after ${retryCount + 1} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
  }

  private static async fetchOnce(url: string, options: {
    timeoutMs: number;
    maxContentLength: number;
    userAgent: string;
  }): Promise<FetchResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'user-agent': options.userAgent,
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf;q=0.8,*/*;q=0.7',
        },
      });

      const statusCode = response.status;
      if (!response.ok && statusCode >= 400) {
        throw new Error(`HTTP ${statusCode}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength > options.maxContentLength) {
        throw new Error(`Content larger than ${options.maxContentLength} bytes`);
      }

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value;
      });

      return {
        responseBody: Buffer.from(arrayBuffer),
        finalUrl: response.url,
        statusCode,
        headers,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  private static async extractPdfText(buffer: Buffer, maxPages: number) {
    const data = await pdfParse(buffer, { max: maxPages });
    return data.text || '';
  }

  private static extractMetaContent(document: Document, name: string): string | undefined {
    return document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ?? undefined;
  }

  private static extractAuthor(document: Document): string | undefined {
    const authorMeta =
      document.querySelector('meta[name="author"]')?.getAttribute('content') ||
      document.querySelector('meta[property="article:author"]')?.getAttribute('content');

    const authorLink = document.querySelector('[rel="author"]')?.textContent;
    const author = authorMeta || authorLink;
    return author ? author.trim() : undefined;
  }

  private static extractPublicationDate(document: Document): string | undefined {
    const selectors = [
      'meta[property="article:published_time"]',
      'meta[name="date"]',
      'meta[property="og:updated_time"]',
      'time[datetime]'
    ];

    const view = document.defaultView;

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (!element) continue;

      if (view && element instanceof view.HTMLMetaElement) {
        const content = element.getAttribute('content');
        if (content) return content;
      }

      if (view && element instanceof view.HTMLTimeElement) {
        const date = element.getAttribute('datetime') || element.textContent;
        if (date) return date.trim();
      }

      if (element.tagName?.toLowerCase() === 'meta') {
        const content = element.getAttribute('content');
        if (content) return content;
      }

      if (element.tagName?.toLowerCase() === 'time') {
        const date = element.getAttribute('datetime') || element.textContent;
        if (date) return date.trim();
      }
    }

    return undefined;
  }

  private static extractCanonicalUrl(document: Document): string | undefined {
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
    if (!canonical) return undefined;

    try {
      return new URL(canonical, document.baseURI || undefined).toString();
    } catch {
      return undefined;
    }
  }

  private static extractBodyText(document: Document): string {
    const cloned = document.body.cloneNode(true) as HTMLElement;
    const selectorsToRemove = [
      'script',
      'style',
      'nav',
      'header',
      'footer',
      'noscript',
      'iframe',
      '.advertisement',
      '.ads',
      '.social-share',
      '.sidebar',
      '.related',
      '.comments',
    ];

    selectorsToRemove.forEach((selector) => {
      cloned.querySelectorAll(selector).forEach((node) => node.remove());
    });

    return cloned.textContent || '';
  }

  private static canonicalizeUrl(value: string): string {
    try {
      const url = new URL(value);
      url.hash = '';

      const params = url.searchParams;
      const keysToRemove: string[] = [];
      params.forEach((_, key) => {
        if (key.toLowerCase().startsWith('utm_') || key.toLowerCase() === 'fbclid') {
          keysToRemove.push(key);
        }
      });
      keysToRemove.forEach((key) => params.delete(key));

      url.search = params.toString();
      url.pathname = url.pathname.replace(/\/+/g, '/');
      if (url.pathname !== '/' && url.pathname.endsWith('/')) {
        url.pathname = url.pathname.slice(0, -1);
      }
      url.host = url.host.toLowerCase();
      return url.toString();
    } catch {
      return value;
    }
  }

  private static getDomain(value: string): string {
    try {
      return new URL(value).hostname;
    } catch {
      return '';
    }
  }

  private static countWords(value: string): number {
    if (!value) return 0;
    return value.trim().split(/\s+/).filter(Boolean).length;
  }

  private static normalizeWhitespace(value: string): string {
    if (!value) return '';

    const sanitized = value
      .replace(/\r\n/g, '\n')
      .replace(/\u00a0/g, ' ')
      .replace(/\t/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const paragraphs = sanitized
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.replace(/ +/g, ' ').trim())
      .filter(Boolean);

    return paragraphs.join('\n\n');
  }

  private static deriveTitleFromPdf(url: string): string {
    try {
      const { pathname } = new URL(url);
      const filename = pathname.split('/').filter(Boolean).pop() || 'Document';
      return decodeURIComponent(filename.replace(/[-_]/g, ' ')).replace(/\.pdf$/i, '').trim() || 'Document';
    } catch {
      return 'Document';
    }
  }

  private static fallbackTitleFromUrl(url: string): string {
    try {
      const parsed = new URL(url);
      const chunk = parsed.pathname.split('/').filter(Boolean).pop();
      if (chunk) {
        return decodeURIComponent(chunk).replace(/[-_]/g, ' ');
      }
      return parsed.hostname;
    } catch {
      return 'Untitled Page';
    }
  }
}
