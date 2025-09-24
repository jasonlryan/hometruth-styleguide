import { NextRequest, NextResponse } from 'next/server';
import { pineconeService } from '@/lib/pinecone';
import { DocumentProcessor } from '@/lib/document-processor';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Knowledge upload request received');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadata = JSON.parse(formData.get('metadata') as string);

    console.log('📋 Upload metadata:', {
      title: metadata.title,
      category: metadata.category,
      tags: metadata.tags,
      hasFile: !!file,
      hasContent: !!metadata.content,
      fileSize: file ? `${(file.size / 1024).toFixed(1)}KB` : 'N/A'
    });

    if (!file && !metadata.content) {
      return NextResponse.json({ error: 'File or content is required' }, { status: 400 });
    }

    let processedFile: File;

    if (file) {
      // Handle file upload without decoding to avoid double-loading into memory
      processedFile = file;
    } else {
      // Handle text content
      const content = metadata.content;
      processedFile = new File([content], `${metadata.title}.txt`, { type: 'text/plain' });
    }
    
    // Process the content
    console.log('📊 Processing document...');
    let processedDoc;
    try {
      processedDoc = await DocumentProcessor.processDocument(processedFile, {
        name: metadata.title,
        type: 'Knowledge Base Article',
        category: metadata.category || 'General',
        tags: metadata.tags || [],
        userId: 'system', // System content
        documentId: metadata.documentId || `kb_${Date.now()}`,
        priority: metadata.priority || 'normal',
        source: metadata.source || 'Manual Upload',
        url: metadata.url,
        autoUpdate: metadata.autoUpdate || false,
        version: metadata.version || 1
      });
    } catch (error) {
      console.error('❌ Document processing error:', error);
      if (error instanceof Error && error.message.includes('too large')) {
        return NextResponse.json({ error: error.message }, { status: 413 });
      }
      throw error;
    }
    
    // Upload to knowledge base with progress tracking
    console.log('📊 Processing document with', processedDoc.chunks.length, 'chunks');
    try {
      const result = await pineconeService.upsertKnowledgeContent(processedDoc.chunks);
      console.log('✅ Successfully uploaded to Pinecone:', result);
      const stats = await pineconeService.getKnowledgeBaseStats();
      
      return NextResponse.json({
        success: true,
        documentId: processedDoc.metadata.id,
        chunksUploaded: processedDoc.chunks.length,
        result,
        stats,
      });
    } catch (error) {
      console.error('❌ Pinecone upload error:', error);
      throw new Error('Failed to upload to knowledge base');
    }

  } catch (error) {
    console.error('Knowledge upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload knowledge content' },
      { status: 500 }
    );
  }
}
