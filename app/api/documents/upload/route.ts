import { NextRequest, NextResponse } from 'next/server';
import { pineconeService } from '@/lib/pinecone';
import { DocumentProcessor } from '@/lib/document-processor';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadata = JSON.parse(formData.get('metadata') as string);

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Process the document
    const processedDoc = await DocumentProcessor.processDocument(file, metadata);
    
    // Upload to Pinecone (user documents index)
    const userId = metadata.userId || 'default-user';
    const result = await pineconeService.upsertUserDocuments(processedDoc.chunks, userId);
    
    return NextResponse.json({
      success: true,
      documentId: processedDoc.metadata.id,
      chunksUploaded: processedDoc.chunks.length,
      result
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
