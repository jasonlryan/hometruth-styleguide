import { WebScraper } from './scraper';
import { pineconeService } from './pinecone';
import { OpenAIService } from './openai';
import { DocumentProcessor } from './document-processor';
import crypto from 'crypto';

export interface UpdateableDocument {
  documentId: string;
  url?: string;
  contentHash: string;
  lastUpdated: string;
  version: number;
  autoUpdate: boolean;
}

export class ContentUpdater {
  // Check if URL content has changed
  static async checkForUpdates(url: string, currentHash: string): Promise<{
    hasChanged: boolean;
    newContent?: string;
    newHash?: string;
    error?: string;
  }> {
    try {
      const scrapedContent = await WebScraper.scrapeUrl(url);
      const newHash = this.generateContentHash(scrapedContent.content);
      
      return {
        hasChanged: newHash !== currentHash,
        newContent: scrapedContent.content,
        newHash
      };
    } catch (error) {
      return {
        hasChanged: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Generate hash for content comparison
  static generateContentHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  // Update document in Pinecone
  static async updateDocument(
    documentId: string, 
    newContent: string, 
    url: string,
    existingMetadata: any
  ) {
    try {
      // Delete old document chunks
      await this.deleteDocumentChunks(documentId);

      // Create new file from content
      const file = new File([newContent], `${documentId}.txt`, { type: 'text/plain' });
      
      // Process with updated metadata
      const updatedMetadata = {
        ...existingMetadata,
        lastUpdated: new Date().toISOString(),
        version: (existingMetadata.version || 0) + 1,
        contentHash: this.generateContentHash(newContent),
        url
      };

      const processedDoc = await DocumentProcessor.processDocument(file, updatedMetadata);
      
      // Upload new chunks
      await pineconeService.upsertKnowledgeContent(processedDoc.chunks);

      return {
        success: true,
        documentId,
        newVersion: updatedMetadata.version,
        chunksUpdated: processedDoc.chunks.length
      };
    } catch (error) {
      throw new Error(`Failed to update document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete old document chunks
  static async deleteDocumentChunks(documentId: string) {
    // This would need to be implemented based on how you want to identify chunks
    // For now, we'll rely on the fact that new chunks will overwrite old ones
    // if they have the same IDs
    console.log(`Preparing to update chunks for document: ${documentId}`);
  }

  // Batch check for updates
  static async checkAllUpdatableDocuments(): Promise<{
    totalChecked: number;
    updatesFound: number;
    updatesApplied: number;
    errors: string[];
  }> {
    // This would query your database/storage for documents with autoUpdate: true
    // For now, returning a placeholder structure
    return {
      totalChecked: 0,
      updatesFound: 0,
      updatesApplied: 0,
      errors: []
    };
  }

  // Schedule automatic updates
  static async scheduleUpdateCheck(intervalHours: number = 24) {
    console.log(`Scheduling update checks every ${intervalHours} hours`);
    // In production, you'd use a cron job or scheduled function
    // For now, this is a placeholder
  }
}
