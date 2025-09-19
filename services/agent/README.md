# DeskMate Agent API

A minimal Express.js API service that provides task processing capabilities for the DeskMate system.

## Features

- **POST /api/tasks** - Process tasks using configured LLM provider
- **GET /api/health** - Health check endpoint
- CORS enabled for cross-origin requests
- Security headers via Helmet
- Error handling and logging
- Docker containerized for Railway deployment

## Environment Variables

Required:
- `PRIMARY_LLM_API_KEY` - API key for the configured LLM provider

Optional:
- `PORT` - Server port (default: 3001)
- `PRIMARY_LLM` - LLM provider (default: 'anthropic')  
- `PRIMARY_LLM_MODEL` - Model to use (default: 'claude-3-5-sonnet-20240620')

## API Endpoints

### Health Check
```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "service": "deskmate-agent",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### Task Processing
```
POST /api/tasks
```

Request body:
```json
{
  "task": "Summarize this document",
  "context": {
    "files": [],
    "metadata": {}
  }
}
```

Response:
```json
{
  "id": "task_1234567890",
  "status": "completed", 
  "task": "Summarize this document",
  "result": {
    "type": "text",
    "content": "Task processed by anthropic...",
    "confidence": 0.95,
    "suggestions": ["..."]
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "metadata": {
    "provider": "anthropic",
    "model": "claude-3-5-sonnet-20240620",
    "processing_time": 1234
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production start
npm start
```

## Railway Deployment

1. Create a new Railway service
2. Connect this directory: `services/agent`  
3. Set environment variables:
   - `PRIMARY_LLM_API_KEY` (required)
   - `PRIMARY_LLM` (optional)
   - `PRIMARY_LLM_MODEL` (optional)
4. Deploy!

The service will automatically be available at `https://your-service.railway.app`