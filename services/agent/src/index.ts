import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { startQueue, enqueueTask, getTaskStatus } from './queue';
import { randomUUID } from 'crypto';

const app = express();
const PORT = Number(process.env.PORT || 3001);

// CORS: restrict to UI_ORIGIN if provided
const UI_ORIGIN = process.env.UI_ORIGIN;
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || !UI_ORIGIN) return cb(null, true); // allow server-to-server or if not configured
    if (origin === UI_ORIGIN) return cb(null, true);
    return cb(new Error('CORS: origin not allowed'));
  },
  credentials: true
}));

// Security and JSON body limit
app.use(helmet());
app.use(express.json({ limit: '2mb' }));

// Correlation ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const existing = (req.headers['x-correlation-id'] as string) || undefined;
  const cid = existing || randomUUID();
  (req as any).correlationId = cid;
  res.setHeader('x-correlation-id', cid);
  next();
});

// Health
app.get('/healthz', (_req, res) => {
  res.json({ ok: true, name: 'agent', uptime: process.uptime(), version: '1.0.0' });
});

// Create task
app.post('/api/tasks', async (req, res) => {
  try {
    const { kind, payload } = req.body || {};
    if (!kind || typeof kind !== 'string') {
      return res.status(400).json({ error: 'Invalid body: { kind: string; payload?: any } required' });
    }
    const correlationId: string = (req as any).correlationId;
    const id = await enqueueTask({ kind, payload, correlationId });
    res.status(202).json({ id, correlationId });
  } catch (err: any) {
    console.error('POST /api/tasks error', err);
    res.status(500).json({ error: 'Failed to enqueue task' });
  }
});

// Task status
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const row = await getTaskStatus(id);
    if (!row) return res.status(404).json({ error: 'Not found', id });
    res.json(row);
  } catch (err: any) {
    console.error('GET /api/tasks/:id error', err);
    res.status(500).json({ error: 'Failed to get task status' });
  }
});

async function main() {
  await startQueue();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[agent] listening on ${PORT}`);
  });
}

void main();
