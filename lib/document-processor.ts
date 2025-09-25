import { DocumentMetadata, DocumentChunk } from './pinecone';
import crypto from 'crypto';

export interface ProcessedDocument {
  chunks: DocumentChunk[];
  metadata: DocumentMetadata;
}

export interface ChunkingOptions {
  targetTokens?: number;
  overlapTokens?: number;
  maxTokens?: number;
  minTokens?: number;
}

export class DocumentProcessor {
  // Split text into chunks for better search performance
  static chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    let start = 0;

    // Ensure overlap is sane to avoid infinite loops
    const safeOverlap = Math.max(0, Math.min(overlap, chunkSize - 1));
    const step = Math.max(1, chunkSize - safeOverlap);

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunk = text.slice(start, end);
      if (chunk.length > 0) {
        chunks.push(chunk);
      }

      if (end >= text.length) {
        break; // reached the end; avoid repeating the last window
      }

      start += step;
    }

    return chunks;
  }

  // Process a document and create chunks with metadata
  static async processDocument(
    file: File,
    metadata: Omit<DocumentMetadata, 'id' | 'dateAdded' | 'uploadDate'> & {
      documentId?: string;
      priority?: string;
      source?: string;
      url?: string;
      autoUpdate?: boolean;
      version?: number;
    }
  ): Promise<ProcessedDocument> {
    // Check file size limit (10MB max to prevent memory issues)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }
    
    const finalDocumentId = metadata.documentId || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const uploadDate = new Date().toISOString();
    const dateAdded = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });

    // Extract text from file with streaming approach
    const rawText = await this.extractTextFromFileStreaming(file);
    const text = this.normalizeContent(rawText);
    
    // Check text length limit (2MB of text max to prevent memory issues)
    const MAX_TEXT_LENGTH = 2 * 1024 * 1024; // 2MB of text
    if (text.length > MAX_TEXT_LENGTH) {
      throw new Error(`Document too long. Maximum text length is ${MAX_TEXT_LENGTH / (1024 * 1024)}MB`);
    }
    
    // Generate content hash for update tracking
    const contentHash = this.generateContentHash(text);
    
    // Create chunks with optimized size for better performance
    const textChunks = this.chunkTextByTokens(text, { targetTokens: 1000, overlapTokens: 120 });
    
    // Create document chunks with metadata (streaming approach)
    const chunks: DocumentChunk[] = [];
    const baseMetadata = {
      id: finalDocumentId,
      name: metadata.name,
      type: metadata.type,
      dateAdded,
      starred: metadata.starred,
      category: metadata.category,
      tags: metadata.tags,
      status: metadata.status || 'Processing',
      userId: metadata.userId,
      fileSize: file.size,
      mimeType: file.type,
      uploadDate,
      documentId: finalDocumentId,
      priority: metadata.priority || 'normal',
      source: metadata.source || 'Manual Upload',
      url: metadata.url,
      autoUpdate: metadata.autoUpdate || false,
      version: metadata.version || 1,
      contentHash: contentHash
    };

    // Process chunks in batches to avoid memory issues
    const BATCH_SIZE = 100; // Process 100 chunks at a time for better performance
    for (let i = 0; i < textChunks.length; i += BATCH_SIZE) {
      const batch = textChunks.slice(i, i + BATCH_SIZE);
      const batchChunks = batch.map((chunk, batchIndex) => ({
        id: `${finalDocumentId}_chunk_${i + batchIndex}`,
        chunk_text: chunk,
        metadata: baseMetadata
      }));
      chunks.push(...batchChunks);
      
      // Force garbage collection hint every 500 chunks
      if (i % 500 === 0 && global.gc) {
        global.gc();
      }
    }

    return {
      chunks,
      metadata: baseMetadata
    };
  }

  // Extract text from different file types with streaming approach
  private static async extractTextFromFileStreaming(file: File): Promise<string> {
    try {
      // Use streaming approach for large files
      const arrayBuffer = await file.arrayBuffer();
      
      // Process in chunks to avoid memory issues
      const chunkSize = 64 * 1024; // 64KB chunks
      const chunks: Uint8Array[] = [];
      const uint8Array = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        chunks.push(chunk);
      }
      
      // Combine chunks
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      
      const content = new TextDecoder().decode(result);
      
      switch (file.type) {
        case 'text/plain':
          return content;
        case 'application/json':
          try {
            const json = JSON.parse(content);
            return JSON.stringify(json, null, 2);
          } catch (error) {
            throw new Error('Invalid JSON file');
          }
        case 'text/csv':
          // For CSV, we'll just return the raw content
          return content;
        default:
          // For other file types, try to extract text
          // In a real app, you'd use libraries like pdf-parse, mammoth, etc.
          return content;
      }
    } catch (error) {
      console.error('Error reading file:', error);
      throw new Error('Failed to read file content');
    }
  }

  static normalizeContent(text: string): string {
    if (!text) {
      return '';
    }

    const sanitized = text
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

  static generateContentHash(text: string): string {
    const normalized = this.normalizeContent(text);
    return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
  }

  static hasContentChanged(previousHash: string | undefined | null, nextHash: string): boolean {
    if (!previousHash) {
      return true;
    }
    return previousHash !== nextHash;
  }

  static chunkTextByTokens(text: string, options: ChunkingOptions = {}): string[] {
    const normalized = this.normalizeContent(text);
    if (!normalized) {
      return [];
    }

    const targetTokens = options.targetTokens ?? 1000;
    const minTokens = options.minTokens ?? Math.round(targetTokens * 0.75);
    const maxTokens = options.maxTokens ?? Math.round(targetTokens * 1.25);
    const overlapTokens = options.overlapTokens ?? Math.round(targetTokens * 0.12);

    const sentences = this.segmentIntoSentences(normalized);
    const chunks: string[] = [];
    let currentSegments: string[] = [];
    let currentTokens = 0;

    const flushChunk = (force = false) => {
      if (currentSegments.length === 0) {
        currentTokens = 0;
        return;
      }

      if (!force && currentTokens < minTokens && sentences.length > 0) {
        return;
      }

      const chunkText = currentSegments.join(' ').replace(/\s{2,}/g, ' ').trim();
      if (!chunkText) {
        currentSegments = [];
        currentTokens = 0;
        return;
      }

      chunks.push(chunkText);

      if (overlapTokens > 0) {
        const overlapSegments: string[] = [];
        let overlapCount = 0;
        for (let i = currentSegments.length - 1; i >= 0; i -= 1) {
          overlapSegments.unshift(currentSegments[i]);
          overlapCount += this.estimateTokens(currentSegments[i]);
          if (overlapCount >= overlapTokens) {
            break;
          }
        }
        currentSegments = overlapSegments;
        currentTokens = overlapCount;
      } else {
        currentSegments = [];
        currentTokens = 0;
      }
    };

    for (const sentence of sentences) {
      const tokenCount = this.estimateTokens(sentence);

      if (tokenCount > maxTokens) {
        // Sentence is larger than allowed chunk; split by characters as a fallback
        const hardSplit = this.chunkText(sentence, targetTokens * 4, Math.floor((targetTokens * 4) * 0.1));
        hardSplit.forEach((segment) => {
          currentSegments.push(segment);
          currentTokens += this.estimateTokens(segment);
          flushChunk(true);
        });
        continue;
      }

      if (currentTokens + tokenCount > maxTokens) {
        flushChunk();
      }

      currentSegments.push(sentence);
      currentTokens += tokenCount;

      if (currentTokens >= targetTokens) {
        flushChunk();
      }
    }

    if (currentSegments.length > 0) {
      flushChunk(true);
    }

    return chunks;
  }

  static segmentIntoSentences(text: string): string[] {
    if (!text) {
      return [];
    }

    const hasSegmenter = typeof Intl !== 'undefined' && typeof (Intl as any).Segmenter === 'function';
    if (hasSegmenter) {
      const segmenter = new (Intl as any).Segmenter('en', { granularity: 'sentence' });
      const sentences: string[] = [];
      for (const segment of segmenter.segment(text)) {
        const value = segment.segment.trim();
        if (value) {
          sentences.push(value);
        }
      }
      if (sentences.length > 0) {
        return sentences;
      }
    }

    return text
      .split(/(?<=[.!?])\s+/)
      .map((segment) => segment.trim())
      .filter(Boolean);
  }

  static estimateTokens(text: string): number {
    if (!text) return 0;
    const length = text.trim().length;
    if (length === 0) return 0;
    return Math.max(1, Math.ceil(length / 4));
  }

  static createDeterministicChunkId(base: { url: string; contentHash: string; chunkIndex: number }): string {
    const payload = `${base.url}|${base.contentHash}|${base.chunkIndex}`;
    return crypto.createHash('sha256').update(payload, 'utf8').digest('hex');
  }

  // Extract text from different file types (legacy method for small files)
  private static async extractTextFromFile(file: File): Promise<string> {
    try {
      // Convert File to ArrayBuffer, then to string
      const arrayBuffer = await file.arrayBuffer();
      const content = new TextDecoder().decode(arrayBuffer);
      
      switch (file.type) {
        case 'text/plain':
          return content;
        case 'application/json':
          try {
            const json = JSON.parse(content);
            return JSON.stringify(json, null, 2);
          } catch (error) {
            throw new Error('Invalid JSON file');
          }
        case 'text/csv':
          // For CSV, we'll just return the raw content
          return content;
        default:
          // For other file types, try to extract text
          // In a real app, you'd use libraries like pdf-parse, mammoth, etc.
          return content;
      }
    } catch (error) {
      console.error('Error reading file:', error);
      throw new Error('Failed to read file content');
    }
  }
}
