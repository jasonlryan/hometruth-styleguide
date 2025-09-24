import { NextRequest, NextResponse } from 'next/server';
import { pineconeService } from '@/lib/pinecone';

export async function POST(request: NextRequest) {
  try {
    const { query, topK = 5, filter } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'No query provided' }, { status: 400 });
    }

    // Search knowledge base
    const results = await pineconeService.searchKnowledgeBase(query, topK, filter);
    
    return NextResponse.json({
      success: true,
      results: results.matches,
      totalResults: results.matches?.length || 0
    });

  } catch (error) {
    console.error('Knowledge search error:', error);
    return NextResponse.json(
      { error: 'Failed to search knowledge base' },
      { status: 500 }
    );
  }
}
