import { NextResponse } from 'next/server';
import { pineconeService } from '@/lib/pinecone';

export async function GET() {
  try {
    const kb = await pineconeService.getKnowledgeBaseStats();
    return NextResponse.json({ success: true, kb });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: String(error?.message || error) }, { status: 500 });
  }
}


