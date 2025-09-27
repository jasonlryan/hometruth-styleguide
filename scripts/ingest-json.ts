import 'dotenv/config';

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Command } from 'commander';

import { DocumentProcessor } from '../lib/document-processor';
import { pineconeService } from '../lib/pinecone';

type LogLevel = 'info' | 'debug' | 'error';

interface CliOptions {
  file: string;
  namespace: string;
  logLevel: LogLevel;
}

interface JsonDoc {
  id: string;
  title: string;
  topic?: string;
  content: string;
  content_length?: number;
  target_audience?: string;
  content_quality?: string;
  source?: string;
}

interface InputJson {
  metadata?: Record<string, unknown>;
  documents: JsonDoc[];
}

function info(msg: string) {
  console.log(msg);
}

async function main() {
  const program = new Command();
  program
    .name('ingest-json')
    .description('Ingest a JSON file of documents into Pinecone')
    .option('--file <path>', 'Path to JSON file', '')
    .option('--namespace <name>', 'Pinecone namespace', 'urls')
    .option('--log-level <level>', 'Log level (info|debug)', 'info')
    .parse(process.argv);

  const opts = program.opts();
  const options: CliOptions = {
    file: opts.file,
    namespace: opts.namespace,
    logLevel: (opts.logLevel ?? 'info') as LogLevel,
  };

  if (!options.file) {
    throw new Error('Missing --file argument');
  }

  if (!process.env.PINECONE_API_KEY) {
    throw new Error('PINECONE_API_KEY is required');
  }

  const resolved = path.resolve(options.file);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }

  const raw = fs.readFileSync(resolved, 'utf8');
  const parsed: InputJson = JSON.parse(raw);
  const docs = Array.isArray(parsed?.documents) ? parsed.documents : [];
  if (docs.length === 0) {
    throw new Error('No documents found in JSON');
  }

  info(`Prepared ${docs.length} JSON documents for ingestion`);

  const vectors = [] as Array<{ id: string; chunk_text: string; metadata: any }>;
  for (const doc of docs) {
    const title = doc.title?.trim() || doc.id;
    const topic = doc.topic || 'general';

    const syntheticDomain = 'hometruth.local';
    const canonicalUrl = `https://${syntheticDomain}/${topic}/${encodeURIComponent(doc.id)}`;
    const originalUrl = `file://${resolved}#${encodeURIComponent(doc.id)}`;

    const normalized = DocumentProcessor.normalizeContent(doc.content || '');
    const contentHash = DocumentProcessor.generateContentHash(normalized);
    const chunks = DocumentProcessor.chunkTextByTokens(normalized, {
      targetTokens: 1000,
      overlapTokens: 120,
    });

    const documentId = crypto.createHash('sha256').update(`${canonicalUrl}|${contentHash}`).digest('hex');

    chunks.forEach((chunk, index) => {
      const chunkId = DocumentProcessor.createDeterministicChunkId({
        url: canonicalUrl,
        contentHash,
        chunkIndex: index,
      });
      const chunkWordCount = chunk.trim().split(/\s+/).filter(Boolean).length;
      vectors.push({
        id: chunkId,
        chunk_text: chunk,
        metadata: {
          id: documentId,
          name: title,
          type: 'application/json',
          dateAdded: new Date().toISOString(),
          source: syntheticDomain,
          tags: [parsed?.metadata?.focus ?? 'json'],
          status: 'new',
          documentId,
          url: canonicalUrl,
          originalUrl,
          title,
          contentType: 'application/json',
          chunkIndex: index,
          chunkCount: chunks.length,
          hash: contentHash,
          contentHash,
          wordCount: chunkWordCount,
          charCount: chunk.length,
          accessedAt: undefined,
          ingestedAt: new Date().toISOString(),
          version: 'ingest-json@0.1.0',
          namespace: options.namespace,
        },
      });
    });
  }

  info(`Upserting ${vectors.length} chunks to namespace '${options.namespace}'`);
  await pineconeService.upsertKnowledgeContent(vectors as any, options.namespace);
  info('Done');
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});


