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
    const validatedRequest = TaskRequest.safeParse(body);
    if (!validatedRequest.success) {
      return NextResponse.json({ error: 'Invalid task request format' }, { status: 400 });
    }

    logger.info({ correlationId, idempotencyKey, taskKind: validatedRequest.data.kind }, 'Task request received');
    
    const taskApiBase = process.env.TASK_API_BASE;
    if (!taskApiBase) {
      const mockResponse: TaskResponse = {
        id: uuidv4(),
        status: 'completed',
        message: `Mock ${validatedRequest.data.kind} completed - configure TASK_API_BASE to enable real processing.`
      };
      logger.info({ correlationId, taskId: mockResponse.id, mockImplementation: true }, 'Returning mock task response');
      return NextResponse.json(mockResponse, { status: 200 });
    }
    
    const taskUrl = `${taskApiBase.replace(/\/$/, '')}/tasks`;
    
    const response = await withRetry(async () => {
      const taskResponse = await fetch(taskUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey,
          'x-correlation-id': correlationId,
        },
        body: JSON.stringify(validatedRequest.data),
      });
      if (!taskResponse.ok) {
        if (taskResponse.status >= 500) throw new Error(`Task API server error: ${taskResponse.status}`);
        return NextResponse.json({ error: `Task API error: ${taskResponse.statusText}` }, { status: taskResponse.status });
      }
      return taskResponse;
    }, { attempts: 3, baseDelay: 500, maxDelay: 5000 });
    
    if (response instanceof NextResponse) return response;

    const responseData = await response.json();
    return NextResponse.json(responseData, { status: 202 });
    
  } catch (error) {
    logger.error({ correlationId, idempotencyKey, error: String(error) }, 'Task request failed');
    return NextResponse.json({ status: 'error', message: 'Task request failed. Please try again.' } as TaskResponse, { status: 500 });
  }
}
