import { NextRequest, NextResponse } from 'next/server';
import { ContentUpdater } from '@/lib/content-updater';
import { pineconeService } from '@/lib/pinecone';

export async function POST(request: NextRequest) {
  try {
    const { documentId, url } = await request.json();

    if (!documentId || !url) {
      return NextResponse.json({ 
        error: 'Document ID and URL are required' 
      }, { status: 400 });
    }

    // First, get the current document metadata from Pinecone
    // This is a simplified version - you'd need to implement getDocumentMetadata
    const currentMetadata = await getCurrentDocumentMetadata(documentId);
    
    if (!currentMetadata) {
      return NextResponse.json({ 
        error: 'Document not found' 
      }, { status: 404 });
    }

    // Check if content has changed
    const updateCheck = await ContentUpdater.checkForUpdates(
      url, 
      currentMetadata.contentHash
    );

    if (updateCheck.error) {
      return NextResponse.json({ 
        error: updateCheck.error 
      }, { status: 500 });
    }

    if (!updateCheck.hasChanged) {
      return NextResponse.json({
        success: true,
        updated: false,
        message: 'No changes detected'
      });
    }

    // Update the document
    const result = await ContentUpdater.updateDocument(
      documentId,
      updateCheck.newContent!,
      url,
      currentMetadata
    );

    return NextResponse.json({
      success: true,
      updated: true,
      ...result
    });

  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

// Helper function to get document metadata
// This would need to be implemented based on your storage approach
async function getCurrentDocumentMetadata(documentId: string) {
  // Placeholder - you'd need to implement this based on how you store document metadata
  // Options:
  // 1. Store in separate database (Supabase)
  // 2. Query Pinecone for document chunks and extract metadata
  // 3. Store in file system or cache
  
  return {
    documentId,
    contentHash: 'current_hash_here',
    version: 1,
    lastUpdated: '2024-01-15',
    // ... other metadata
  };
}
