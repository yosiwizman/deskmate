import pino from 'pino';

const logger = pino({
  level: 'info',
  browser: {
    asObject: true
  }
});

export interface RetryOptions {
  attempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  factor?: number;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    attempts = 3,
    baseDelay = 250,
    maxDelay = 5000,
    factor = 2,
  } = options;

  let lastError: any;
  
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const result = await fn();
      if (attempt > 1) {
        logger.info({ attempt, attempts }, 'Retry succeeded');
      }
      return result;
    } catch (error) {
      lastError = error;
      
      logger.warn({ 
        attempt, 
        attempts, 
        error: error instanceof Error ? error.message : String(error) 
      }, 'Retry attempt failed');

      if (attempt === attempts) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(factor, attempt - 1), maxDelay);
      
      logger.info({ attempt, delay }, 'Waiting before retry');
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  logger.error({ 
    attempts, 
    finalError: lastError instanceof Error ? lastError.message : String(lastError) 
  }, 'All retry attempts failed');
  
  throw lastError;
}

// Helper for checking if an error should trigger a retry
export function shouldRetry(error: any): boolean {
  if (!error) return false;
  
  // Retry on network errors
  if (error.code === 'NETWORK_ERROR') return true;
  
  // Retry on 5xx HTTP status codes
  if (error.status >= 500 && error.status < 600) return true;
  
  // Retry on timeout errors
  if (error.name === 'TimeoutError') return true;
  if (error.code === 'ETIMEDOUT') return true;
  
  return false;
}

// Wrapper for fetch with retry logic
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  return withRetry(async () => {
    const response = await fetch(url, options);
    
    // Check if we should retry based on status code
    if (shouldRetry({ status: response.status })) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  }, retryOptions);
}