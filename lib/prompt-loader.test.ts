import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';

const configDir = path.resolve(process.cwd(), 'config');
const execFileAsync = promisify(execFile);

const originalEnv = {
  CHAT_SYSTEM_PROMPT: process.env.CHAT_SYSTEM_PROMPT,
  CHAT_SYSTEM_PROMPT_PATH: process.env.CHAT_SYSTEM_PROMPT_PATH,
  NEXT_RUNTIME: process.env.NEXT_RUNTIME,
  NODE_ENV: process.env.NODE_ENV,
};

function resetEnv() {
  delete process.env.CHAT_SYSTEM_PROMPT;
  delete process.env.CHAT_SYSTEM_PROMPT_PATH;
  delete process.env.NEXT_RUNTIME;
  process.env.NODE_ENV = 'test';
}

test.beforeEach(resetEnv);

test.after(() => {
  if (originalEnv.CHAT_SYSTEM_PROMPT === undefined) {
    delete process.env.CHAT_SYSTEM_PROMPT;
  } else {
    process.env.CHAT_SYSTEM_PROMPT = originalEnv.CHAT_SYSTEM_PROMPT;
  }

  if (originalEnv.CHAT_SYSTEM_PROMPT_PATH === undefined) {
    delete process.env.CHAT_SYSTEM_PROMPT_PATH;
  } else {
    process.env.CHAT_SYSTEM_PROMPT_PATH = originalEnv.CHAT_SYSTEM_PROMPT_PATH;
  }

  if (originalEnv.NEXT_RUNTIME === undefined) {
    delete process.env.NEXT_RUNTIME;
  } else {
    process.env.NEXT_RUNTIME = originalEnv.NEXT_RUNTIME;
  }

  if (originalEnv.NODE_ENV === undefined) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = originalEnv.NODE_ENV;
  }
});

async function importPromptLoader(overrides: Record<string, string | undefined>, query = `?ts=${Date.now()}-${Math.random()}`) {
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  const modulePath = path.resolve(process.cwd(), 'lib/prompt-loader.ts');
  delete require.cache[modulePath];

  const mod = await import(`./prompt-loader.ts${query}`);
  const exported = (mod as any).default ?? mod;
  const loader = exported.PromptLoader as { load(): Promise<any> } & { cache?: unknown };
  if (loader && typeof loader === 'function') {
    (loader as any).cache = undefined;
  }

  return loader;
}

async function writePromptFile(filename: string, content: string) {
  const filePath = path.join(configDir, filename);
  await fs.writeFile(filePath, content, 'utf8');
  return filePath;
}

test('prefers CHAT_SYSTEM_PROMPT over other sources', { concurrency: false }, async () => {
  resetEnv();
  const envPrompt = 'Env priority prompt';
  const pathPrompt = 'Path prompt fallback';
  const filePath = await writePromptFile('test-env-priority.md', pathPrompt);

  const loader = await importPromptLoader({
    CHAT_SYSTEM_PROMPT: envPrompt,
    CHAT_SYSTEM_PROMPT_PATH: path.relative(process.cwd(), filePath),
    NODE_ENV: 'test',
  });

  try {
    const result = await loader.load();
    assert.equal(result.source, 'env');
    assert.equal(result.content, envPrompt);
  } finally {
    await fs.rm(filePath, { force: true });
  }
});

test('uses CHAT_SYSTEM_PROMPT_PATH when env prompt missing', { concurrency: false }, async () => {
  resetEnv();
  const fileContent = 'Path prompt content';
  const filePath = await writePromptFile('test-path.md', fileContent);

  const loader = await importPromptLoader({
    CHAT_SYSTEM_PROMPT: undefined,
    CHAT_SYSTEM_PROMPT_PATH: path.relative(process.cwd(), filePath),
    NODE_ENV: 'test',
  });

  try {
    const result = await loader.load();
    assert.equal(result.source, 'env-path');
    assert.equal(result.content, fileContent);
  } finally {
    await fs.rm(filePath, { force: true });
  }
});

test('falls back to config file when no env overrides present', { concurrency: false }, async () => {
  resetEnv();
  const configFilePath = path.join(configDir, 'chat-system-prompt.md');
  const configContent = await fs.readFile(configFilePath, 'utf8');

  const loader = await importPromptLoader({
    CHAT_SYSTEM_PROMPT: undefined,
    CHAT_SYSTEM_PROMPT_PATH: undefined,
    NODE_ENV: 'test',
  });

  const result = await loader.load();
  assert.equal(result.source, 'file');
  assert.ok(result.content.includes('You are HomeTruth'));
  assert.equal(result.content.trim(), configContent.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '').trim());
});

test('rejects prompt files outside the project directory', { concurrency: false }, async () => {
  resetEnv();
  const loader = await importPromptLoader({
    CHAT_SYSTEM_PROMPT: undefined,
    CHAT_SYSTEM_PROMPT_PATH: '../outside-prompt.md',
    NODE_ENV: 'test',
  });

  const result = await loader.load();
  assert.equal(result.source, 'file');
});

test('falls back to default when running in edge runtime', { concurrency: false }, async () => {
  resetEnv();
  const script = `import('./lib/prompt-loader.ts').then((mod) => {
    const loader = (mod.default ?? mod).PromptLoader;
    return loader.load();
  }).then((result) => {
    console.log(JSON.stringify(result));
  }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });`;

  const env = { ...process.env, NEXT_RUNTIME: 'edge', NODE_ENV: 'production' } as NodeJS.ProcessEnv;
  delete env.CHAT_SYSTEM_PROMPT;
  delete env.CHAT_SYSTEM_PROMPT_PATH;

  const { stdout } = await execFileAsync(process.execPath, ['--import', 'tsx', '--eval', script], {
    env,
  });

  const outputLines = stdout.trim().split('\n');
  const jsonLine = outputLines.reverse().find((line) => line.startsWith('{')) ?? '{}';
  const result = JSON.parse(jsonLine);

  assert.equal(result.source, 'default');
  assert.ok(result.content.includes('You are HomeTruth'));
});

test('enforces maximum prompt size and falls back to config file', { concurrency: false }, async () => {
  resetEnv();
  const largeContent = 'x'.repeat(20_000);

  const loader = await importPromptLoader({
    CHAT_SYSTEM_PROMPT: largeContent,
    CHAT_SYSTEM_PROMPT_PATH: undefined,
    NODE_ENV: 'test',
  });

  const result = await loader.load();
  assert.notEqual(result.source, 'env');
  assert.ok(['env-path', 'file', 'default'].includes(result.source));
});

test('detects invalid UTF-8 replacement characters and falls back to config file', { concurrency: false }, async () => {
  resetEnv();
  const invalidContent = 'Invalid \uFFFD prompt';
  const filePath = await writePromptFile('test-invalid.md', invalidContent);

  const loader = await importPromptLoader({
    CHAT_SYSTEM_PROMPT: undefined,
    CHAT_SYSTEM_PROMPT_PATH: path.relative(process.cwd(), filePath),
    NODE_ENV: 'test',
  });

  try {
    const result = await loader.load();
    assert.notEqual(result.source, 'env-path');
  } finally {
    await fs.rm(filePath, { force: true });
  }
});

test('caches prompt in production and reloads in development', { concurrency: false }, async () => {
  resetEnv();
  const cacheFile = await writePromptFile('test-cache.md', 'version-one');

  const prodLoader = await importPromptLoader({
    CHAT_SYSTEM_PROMPT: undefined,
    CHAT_SYSTEM_PROMPT_PATH: path.relative(process.cwd(), cacheFile),
    NODE_ENV: 'production',
  }, '?prod-cache');

  const firstProd = await prodLoader.load();
  assert.equal(firstProd.content, 'version-one');

  await fs.writeFile(cacheFile, 'version-two', 'utf8');

  const secondProd = await prodLoader.load();
  assert.equal(secondProd.content, 'version-one');

  await fs.writeFile(cacheFile, 'dev-version-one', 'utf8');
  resetEnv();

  const devLoader = await importPromptLoader({
    CHAT_SYSTEM_PROMPT: undefined,
    CHAT_SYSTEM_PROMPT_PATH: path.relative(process.cwd(), cacheFile),
    NODE_ENV: 'development',
  }, '?dev-cache');

  try {
    const first = await devLoader.load();
    assert.equal(first.content, 'dev-version-one');

    await fs.writeFile(cacheFile, 'dev-version-two', 'utf8');

    const second = await devLoader.load();
    assert.equal(second.content, 'dev-version-two');
  } finally {
    await fs.rm(cacheFile, { force: true });
  }
});
