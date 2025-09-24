import { NextRequest, NextResponse } from 'next/server';
import { pineconeService } from '@/lib/pinecone';

export async function POST(req: NextRequest) {
  try {
    const { documentId } = await req.json();
    if (!documentId) return NextResponse.json({ success: false, error: 'documentId is required' }, { status: 400 });

    const result = await pineconeService.deleteKnowledgeDocument(documentId);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: String(error?.message || error) }, { status: 500 });
  }
}


