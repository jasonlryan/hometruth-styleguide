import { NextRequest, NextResponse } from 'next/server';
import { pineconeService } from '@/lib/pinecone';

export async function GET() {
  try {
    const kb = await pineconeService.getKnowledgeBaseStats();
    return NextResponse.json({ success: true, kb });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: String(error?.message || error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, namespaces = ['general', 'urls'], topK = 5, filter } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const nsList: string[] = Array.isArray(namespaces)
      ? namespaces
      : typeof namespaces === 'string'
        ? namespaces.split(',').map((s) => s.trim()).filter(Boolean)
        : ['general', 'urls'];

    const results: Record<string, { count: number; samples: Array<{ title?: string; url?: string }> }> = {};

    for (const ns of nsList) {
      const res = await pineconeService.searchKnowledgeBase(query, topK, filter, ns);
      const matches = Array.isArray(res?.matches) ? res.matches : [];
      results[ns] = {
        count: matches.length,
        samples: matches.slice(0, 3).map((m: any) => ({
          title: m?.metadata?.name ?? m?.metadata?.title,
          url: m?.metadata?.url ?? m?.metadata?.sourceUrl ?? m?.metadata?.href,
        })),
      };
    }

    return NextResponse.json({ success: true, query, results });
  } catch (error) {
    console.error('Knowledge stats error:', error);
    return NextResponse.json({ error: 'Failed to query knowledge stats' }, { status: 500 });
  }
}


