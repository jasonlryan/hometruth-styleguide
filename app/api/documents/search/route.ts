import { NextRequest, NextResponse } from 'next/server';
import { pineconeService } from '@/lib/pinecone';

export async function POST(request: NextRequest) {
  try {
    const { query, topK = 5, filter, userId = 'default-user', searchType = 'user', namespace } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'No query provided' }, { status: 400 });
    }

    let results;
    
    if (searchType === 'user') {
      // Search user documents only
      results = await pineconeService.searchUserDocuments(query, userId, topK, filter);
    } else if (searchType === 'knowledge') {
      // Search knowledge base only
      results = await pineconeService.searchKnowledgeBase(query, topK, filter, namespace);
    } else {
      // Search both user docs and knowledge base
      const combinedResults = await pineconeService.searchAll(query, userId, topK);
      return NextResponse.json({
        success: true,
        userDocuments: combinedResults.userDocuments,
        knowledgeBase: combinedResults.knowledgeBase,
        totalResults: combinedResults.userDocuments.length + combinedResults.knowledgeBase.length
      });
    }
    
    return NextResponse.json({
      success: true,
      results: results.matches,
      totalResults: results.matches?.length || 0
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search documents' },
      { status: 500 }
    );
  }
}
