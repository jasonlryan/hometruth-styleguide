import puppeteer from 'puppeteer';

export interface ScrapedContent {
  title: string;
  content: string;
  url: string;
  metadata: {
    description?: string;
    author?: string;
    publishedDate?: string;
    domain: string;
    wordCount: number;
  };
}

export class WebScraper {
  static async scrapeUrl(url: string): Promise<ScrapedContent> {
    let browser;
    
    try {
      // Launch browser
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      const page = await browser.newPage();
      
      // Set user agent to avoid blocking
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigate to URL with timeout
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Extract content using page evaluation
      const scrapedData = await page.evaluate(() => {
        // Helper function to clean text
        const cleanText = (text: string) => {
          return text
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, '\n')
            .trim();
        };

        // Get title
        const title = document.title || 
                     document.querySelector('h1')?.textContent || 
                     'Untitled Page';

        // Get meta description
        const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

        // Get author
        const author = document.querySelector('meta[name="author"]')?.getAttribute('content') || 
                      document.querySelector('[rel="author"]')?.textContent || '';

        // Get published date
        const publishedDate = document.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ||
                             document.querySelector('meta[name="date"]')?.getAttribute('content') ||
                             document.querySelector('time')?.getAttribute('datetime') || '';

        // Extract main content
        let content = '';
        
        // Try to find main content area
        const mainSelectors = [
          'main',
          'article',
          '[role="main"]',
          '.main-content',
          '.content',
          '.post-content',
          '.entry-content',
          '#content',
          '.article-body'
        ];

        let mainElement = null;
        for (const selector of mainSelectors) {
          mainElement = document.querySelector(selector);
          if (mainElement) break;
        }

        if (mainElement) {
          // Remove unwanted elements
          const unwantedSelectors = [
            'script', 'style', 'nav', 'header', 'footer',
            '.advertisement', '.ads', '.social-share',
            '.comments', '.related-posts', '.sidebar'
          ];
          
          unwantedSelectors.forEach(selector => {
            const elements = mainElement!.querySelectorAll(selector);
            elements.forEach(el => el.remove());
          });

          content = mainElement.textContent || '';
        } else {
          // Fallback: get body text and clean it
          const bodyClone = document.body.cloneNode(true) as HTMLElement;
          
          // Remove unwanted elements from clone
          const unwantedSelectors = [
            'script', 'style', 'nav', 'header', 'footer',
            '.advertisement', '.ads', '.social-share',
            '.comments', '.related-posts', '.sidebar',
            '.menu', '.navigation'
          ];
          
          unwantedSelectors.forEach(selector => {
            const elements = bodyClone.querySelectorAll(selector);
            elements.forEach(el => el.remove());
          });

          content = bodyClone.textContent || '';
        }

        return {
          title: cleanText(title),
          content: cleanText(content),
          description: cleanText(description),
          author: cleanText(author),
          publishedDate: publishedDate
        };
      });

      const domain = new URL(url).hostname;
      const wordCount = scrapedData.content.split(/\s+/).length;

      return {
        title: scrapedData.title,
        content: scrapedData.content,
        url,
        metadata: {
          description: scrapedData.description,
          author: scrapedData.author,
          publishedDate: scrapedData.publishedDate,
          domain,
          wordCount
        }
      };

    } catch (error) {
      throw new Error(`Failed to scrape URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  static isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }
}
