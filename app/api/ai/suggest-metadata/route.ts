import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { text, filename } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Use OpenAI when configured, otherwise fall back to heuristic analysis
    const analysis = await OpenAIService.analyzeDocument(text, filename);
    if (!analysis.success) {
      const fallback = OpenAIService.generateFallbackMetadata(text, filename);
      return NextResponse.json({ success: true, ...fallback });
    }

    return NextResponse.json({
      success: true,
      title: analysis.title,
      category: analysis.category,
      priority: analysis.priority,
      source: analysis.source,
      tags: analysis.tags,
      summary: analysis.summary
    });

  } catch (error) {
    console.error('Metadata suggestion error:', error);
    return NextResponse.json(
      { error: 'Failed to suggest metadata' },
      { status: 500 }
    );
  }
}
