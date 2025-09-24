import { NextRequest, NextResponse } from 'next/server';
import { WebScraper } from '@/lib/scraper';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    // Validate URL format
    if (!WebScraper.isValidUrl(url)) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Scrape the URL
    const scrapedContent = await WebScraper.scrapeUrl(url);

    return NextResponse.json({
      success: true,
      title: scrapedContent.title,
      content: scrapedContent.content,
      url: scrapedContent.url,
      metadata: scrapedContent.metadata
    });

  } catch (error) {
    console.error('URL scraping error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scrape URL' 
      },
      { status: 500 }
    );
  }
}
