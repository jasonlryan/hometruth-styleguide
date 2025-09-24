import { DocumentMetadata, DocumentChunk } from './pinecone';
import crypto from 'crypto';

export interface ProcessedDocument {
  chunks: DocumentChunk[];
  metadata: DocumentMetadata;
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
    const text = await this.extractTextFromFileStreaming(file);
    
    // Check text length limit (2MB of text max to prevent memory issues)
    const MAX_TEXT_LENGTH = 2 * 1024 * 1024; // 2MB of text
    if (text.length > MAX_TEXT_LENGTH) {
      throw new Error(`Document too long. Maximum text length is ${MAX_TEXT_LENGTH / (1024 * 1024)}MB`);
    }
    
    // Generate content hash for update tracking
    const contentHash = crypto.createHash('sha256').update(text).digest('hex');
    
    // Create chunks with optimized size for better performance
    const textChunks = this.chunkText(text, 1000, 150); // Balanced chunks for better search
    
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
