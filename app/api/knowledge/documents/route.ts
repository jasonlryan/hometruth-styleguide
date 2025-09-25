import { NextRequest, NextResponse } from 'next/server';
import { pineconeService } from '@/lib/pinecone';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const cursor = searchParams.get('cursor') || undefined;
    const namespace = searchParams.get('namespace') || undefined;

    const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam))) : 20;

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
