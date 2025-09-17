import { NextRequest, NextResponse } from 'next/server';
import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';
import { TaskRequest, TaskResponse } from '@/lib/contracts';
import { withRetry } from '@/lib/retry';

const logger = pino({ level: 'info' });

export async function POST(request: NextRequest) {
  const correlationId = uuidv4();
  const idempotencyKey = uuidv4();
  
  try {
    const body = await request.json();
    const validatedRequest = TaskRequest.parse(body);
    
    logger.info({ 
      correlationId, 
      idempotencyKey,
      taskKind: validatedRequest.kind 
    }, 'Task request received');
    
    const taskApiBase = process.env.TASK_API_BASE;
    
    if (!taskApiBase) {
      logger.error({ correlationId }, 'TASK_API_BASE not configured');
      return NextResponse.json(
        { error: 'Task service not configured' },
        { status: 500 }
      );
    }
    
    const taskUrl = `${taskApiBase.replace(/\/$/, '')}/tasks`;
    
    const response = await withRetry(async () => {
      logger.info({ 
        correlationId, 
        idempotencyKey,
        attempt: 'current',
        url: taskUrl 
      }, 'Making task API request');
      
      const taskResponse = await fetch(taskUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(validatedRequest),
      });
      
      // Log response details (without sensitive data)
      logger.info({ 
        correlationId, 
        idempotencyKey,
        status: taskResponse.status,
        statusText: taskResponse.statusText
      }, 'Task API response received');
      
      if (!taskResponse.ok) {
        // Check if we should retry based on status code
        if (taskResponse.status >= 500 && taskResponse.status < 600) {
          throw new Error(`Task API server error: ${taskResponse.status}`);
        }
        
        // For 4xx errors, don't retry
        const errorText = await taskResponse.text();
        logger.warn({ 
          correlationId, 
          status: taskResponse.status, 
          error: errorText 
        }, 'Task API client error - not retrying');
        
        return NextResponse.json(
          { error: `Task API error: ${taskResponse.statusText}` },
          { status: taskResponse.status }
        );
      }
      
      return taskResponse;
    }, {
      attempts: 3,
      baseDelay: 500,
      maxDelay: 5000,
    });
    
    // If response is already a NextResponse (from error handling above), return it
    if (response instanceof NextResponse) {
      return response;
    }
    
    const responseData = await response.json();
    
    // Validate the response matches our expected format
    try {
      TaskResponse.parse(responseData);
    } catch (validationError) {
      logger.warn({ 
        correlationId, 
        validationError: validationError instanceof Error ? validationError.message : String(validationError) 
      }, 'Task API response validation failed');
    }
    
    logger.info({ 
      correlationId, 
      idempotencyKey,
      taskId: responseData.id,
      status: responseData.status 
    }, 'Task request completed successfully');
    
    return NextResponse.json(responseData, { status: response.status });
    
  } catch (error) {
    logger.error({ 
      correlationId, 
      idempotencyKey,
      error: error instanceof Error ? error.message : String(error) 
    }, 'Task request failed');
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid task request format' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Task request failed. Please try again.' 
      } as TaskResponse,
      { status: 500 }
    );
  }
}