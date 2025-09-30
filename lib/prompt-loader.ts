import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import { DEFAULT_CHAT_SYSTEM_PROMPT } from './prompt-defaults';

type PromptSource = 'env' | 'env-path' | 'file' | 'default';

export interface PromptLoaderResult {
  content: string;
  source: PromptSource;
  hash: string;
  sizeBytes: number;
}

const projectRoot = process.cwd();
const processRef: NodeJS.Process | undefined =
  typeof process !== 'undefined' && process?.versions?.node ? process : undefined;

const runtime: 'nodejs' | 'edge' = (() => {
  if (!processRef) {
    return 'edge';
  }
  if (processRef.env?.NEXT_RUNTIME === 'edge') {
    return 'edge';
  }
  return 'nodejs';
})();

const isDevelopment = processRef?.env?.NODE_ENV === 'development';
const maxPromptSizeBytes = (() => {
  const raw = processRef?.env?.CHAT_SYSTEM_PROMPT_MAX_SIZE;
  const parsed = raw ? Number(raw) : Number.NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 16_384;
  }
  return Math.floor(parsed);
})();

const CONTROL_CHARS_REGEX = /[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g;

function logRuntimeMode() {
  if (typeof console === 'undefined') {
    return;
  }
  console.info('[prompt-loader] Runtime mode:', runtime);
}

logRuntimeMode();

async function readFileWithinProject(resolvedPath: string) {
  const relative = path.relative(projectRoot, resolvedPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to read prompt file outside project directory: ${resolvedPath}`);
  }

  await fs.access(resolvedPath, fs.constants.R_OK);
  return fs.readFile(resolvedPath, 'utf8');
}

function sanitizeContent(content: string): string {
  return content.replace(CONTROL_CHARS_REGEX, '');
}

function buildResult(source: PromptSource, content: string): PromptLoaderResult | undefined {
  const sanitized = sanitizeContent(content);
  const sizeBytes = Buffer.byteLength(sanitized, 'utf8');

  if (sizeBytes > maxPromptSizeBytes) {
    console.warn(
      `[prompt-loader] Prompt from ${source} exceeded max size (${sizeBytes} bytes > ${maxPromptSizeBytes}).`,
    );
    return undefined;
  }

  if (sanitized.includes('\uFFFD')) {
    console.warn(`[prompt-loader] Prompt from ${source} contains invalid UTF-8 sequences.`);
    return undefined;
  }

  const hash = crypto.createHash('sha256').update(sanitized).digest('hex').slice(0, 8);

  return {
    content: sanitized,
    source,
    hash,
    sizeBytes,
  };
}

async function loadFromEnv(): Promise<PromptLoaderResult | undefined> {
  const envValue = processRef?.env?.CHAT_SYSTEM_PROMPT;
  if (typeof envValue === 'string' && envValue.trim().length > 0) {
    const result = buildResult('env', envValue);
    if (!result) {
      console.warn('[prompt-loader] CHAT_SYSTEM_PROMPT environment variable invalid. Falling back to next source.');
    }
    return result;
  }
  return undefined;
}

async function loadFromEnvPath(): Promise<PromptLoaderResult | undefined> {
  if (runtime !== 'nodejs') {
    return undefined;
  }

  const envPath = processRef?.env?.CHAT_SYSTEM_PROMPT_PATH;
  if (!envPath) {
    return undefined;
  }

  try {
    const resolved = path.resolve(projectRoot, envPath);
    const fileContent = await readFileWithinProject(resolved);
    const result = buildResult('env-path', fileContent);
    if (!result) {
      console.warn('[prompt-loader] CHAT_SYSTEM_PROMPT_PATH prompt invalid. Falling back to next source.');
    }
    return result;
  } catch (error) {
    console.error('[prompt-loader] Failed to load prompt from CHAT_SYSTEM_PROMPT_PATH:', error);
    return undefined;
  }
}

async function loadFromConfigFile(): Promise<PromptLoaderResult | undefined> {
  if (runtime !== 'nodejs') {
    return undefined;
  }

  try {
    const resolved = path.resolve(projectRoot, 'config/chat-system-prompt.md');
    const fileContent = await readFileWithinProject(resolved);
    const result = buildResult('file', fileContent);
    if (!result) {
      console.warn('[prompt-loader] config/chat-system-prompt.md prompt invalid. Falling back to fallback/default prompt.');
    }
    return result;
  } catch (error) {
    console.error('[prompt-loader] Failed to load prompt from config/chat-system-prompt.md:', error);
    return undefined;
  }
}

async function ensureDefaultFileExists() {
  if (runtime !== 'nodejs') {
    return;
  }

  try {
    const resolved = path.resolve(projectRoot, 'config/chat-system-prompt.md');
    await fs.access(resolved, fs.constants.R_OK);
  } catch (error) {
    console.warn('[prompt-loader] Default prompt file missing or unreadable at config/chat-system-prompt.md');
  }
}

void ensureDefaultFileExists();

export class PromptLoader {
  private static cache?: PromptLoaderResult;

  static async load(): Promise<PromptLoaderResult> {
    if (runtime === 'nodejs' && !isDevelopment && this.cache) {
      return this.cache;
    }

    if (isDevelopment) {
      if (this.cache) {
        console.info('[prompt-loader] Cache bypass (development): reloading prompt despite existing cache.');
      } else {
        console.info('[prompt-loader] Cache miss (development): loading prompt.');
      }
    }

    const loaders = [loadFromEnv, loadFromEnvPath, loadFromConfigFile];

    for (const loader of loaders) {
      try {
        const result = await loader();
        if (result) {
          if (runtime === 'nodejs') {
            this.cache = result;
          }
          return result;
        }
      } catch (error) {
        console.error('[prompt-loader] Unexpected error while loading prompt:', error);
      }
    }

    const fallback = buildResult('default', DEFAULT_CHAT_SYSTEM_PROMPT);
    if (!fallback) {
      throw new Error('[prompt-loader] Default prompt is invalid.');
    }

    if (runtime === 'nodejs') {
      this.cache = fallback;
    }

    return fallback;
  }
}

export async function loadSystemPrompt() {
  const result = await PromptLoader.load();
  return result.content ?? DEFAULT_CHAT_SYSTEM_PROMPT;
}

export const promptLoader = PromptLoader;
