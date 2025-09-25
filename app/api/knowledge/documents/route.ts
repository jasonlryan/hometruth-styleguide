import { NextRequest, NextResponse } from 'next/server';
import { pineconeService } from '@/lib/pinecone';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const cursor = searchParams.get('cursor') || undefined;
    const namespace = searchParams.get('namespace') || undefined;
    const previewId = searchParams.get('previewId') || undefined;

    const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam))) : 20;

    // Preview mode: return chunks for a specific document
    if (previewId) {
      const chunks = await pineconeService.getKnowledgeDocumentChunks(previewId, namespace || 'urls');
      const normalized = chunks.map((m: any) => ({
        id: m?.id,
        chunkText:
          (m?.metadata?.chunk_text || m?.metadata?.chunkText || '').toString(),
        wordCount: Number(m?.metadata?.wordCount ?? 0) || undefined,
        charCount: Number(m?.metadata?.charCount ?? 0) || undefined,
        url:
          m?.metadata?.url || m?.metadata?.originalUrl || m?.metadata?.sourceUrl,
        title: m?.metadata?.title || m?.metadata?.name,
        hash: m?.metadata?.hash || m?.metadata?.contentHash,
        chunkIndex: Number(m?.metadata?.chunkIndex ?? 0) || 0,
        chunkCount: Number(m?.metadata?.chunkCount ?? 0) || undefined,
      }));

      return NextResponse.json({ success: true, chunks: normalized });
    }

    const result = await pineconeService.listKnowledgeDocuments({
      limit,
      paginationToken: cursor,
      namespace,
    });

    return NextResponse.json({
      success: true,
      documents: result.documents,
      nextPageToken: result.nextPageToken,
    });
  } catch (error: any) {
    console.error('Failed to list knowledge documents:', error);
    return NextResponse.json(
      { success: false, error: String(error?.message || error) },
      { status: 500 }
    );
  }
}
