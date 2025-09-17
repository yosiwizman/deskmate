import { NextRequest, NextResponse } from 'next/server';
import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';
import { SearchRequest, SearchResponse, SearchHit } from '@/lib/contracts';
import { withRetry } from '@/lib/retry';

const logger = pino({ level: 'info' });

export async function POST(request: NextRequest) {
  const correlationId = uuidv4();
  
  try {
    const body = await request.json();
    const validatedRequest = SearchRequest.parse(body);
    
    logger.info({ correlationId, query: validatedRequest.q }, 'Search request received');
    
    const provider = process.env.SEARCH_API || 'tavily';
    const apiKey = process.env.SEARCH_API_KEY;
    
    if (!apiKey) {
      logger.warn({ correlationId, provider }, 'Search API key not configured');
      return NextResponse.json({ results: [] } as SearchResponse);
    }
    
    let results: SearchHit[] = [];
    
    if (provider === 'tavily') {
      results = await withRetry(async () => {
        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: apiKey,
            query: validatedRequest.q,
            include_answer: true,
            max_results: 5,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Tavily API error: ${response.status}`);
        }
        
        const data = await response.json();
        logger.info({ correlationId, resultCount: data.results?.length }, 'Tavily search completed');
        
        return (data.results || []).map((item: any) => ({
          title: item.title,
          url: item.url,
          content: item.content,
        }));
      });
    } else if (provider === 'brave') {
      results = await withRetry(async () => {
        const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(validatedRequest.q)}`, {
          headers: {
            'X-Subscription-Token': apiKey,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Brave API error: ${response.status}`);
        }
        
        const data = await response.json();
        logger.info({ correlationId, resultCount: data.web?.results?.length }, 'Brave search completed');
        
        return (data.web?.results || []).map((item: any) => ({
          title: item.title,
          url: item.url,
          content: item.description,
        }));
      });
    } else if (provider === 'serpapi') {
      results = await withRetry(async () => {
        const response = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(validatedRequest.q)}&api_key=${apiKey}`);
        
        if (!response.ok) {
          throw new Error(`SerpAPI error: ${response.status}`);
        }
        
        const data = await response.json();
        logger.info({ correlationId, resultCount: data.organic_results?.length }, 'SerpAPI search completed');
        
        return (data.organic_results || []).map((item: any) => ({
          title: item.title,
          url: item.link,
          content: item.snippet,
        }));
      });
    } else {
      logger.error({ correlationId, provider }, 'Unsupported search provider');
      return NextResponse.json(
        { error: 'provider not configured' },
        { status: 400 }
      );
    }
    
    const response: SearchResponse = { results };
    return NextResponse.json(response);
    
  } catch (error) {
    logger.error({ 
      correlationId, 
      error: error instanceof Error ? error.message : String(error) 
    }, 'Search request failed');
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Search request failed' },
      { status: 500 }
    );
  }
}