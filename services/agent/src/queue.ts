import Boss from 'pg-boss';
import { Pool } from 'pg';
import { runTask } from './llm';
import fs from 'fs/promises';
import path from 'path';

const jobName = 'agent.task';
let boss: Boss;
let pool: Pool;

export type TaskStatus = 'queued' | 'working' | 'completed' | 'failed';

async function migrate(pool: Pool) {
  const sqlPath = path.join(__dirname, '..', 'sql', '0001_init.sql');
  const sql = await fs.readFile(sqlPath, 'utf8');
  await pool.query(sql);
}

export async function startQueue() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn('[agent] DATABASE_URL is not set. Queue will still start but DB-backed status will be unavailable.');
  }

  pool = new Pool({ connectionString });
  await migrate(pool).catch((err) => {
    console.error('[agent] migration failed:', err.message);
  });

  boss = new Boss({ connectionString });
  await boss.start();

  await boss.work(jobName, { teamSize: 2 }, async (job) => {
    const id = job.id as string;
    const { kind, payload, correlationId } = job.data || {};

    await upsertResult(id, 'working');

    try {
      const result = await runTask(kind, payload, correlationId);
      await upsertResult(id, 'completed', result, null);
      return result;
    } catch (err: any) {
      const message = err?.message || 'unknown-error';
      await upsertResult(id, 'failed', null, message);
      throw err;
    }
  });

  console.log('[agent] pg-boss started, job:', jobName);
}

interface EnqueueInput { kind: string; payload?: any; correlationId?: string }
export async function enqueueTask({ kind, payload, correlationId }: EnqueueInput): Promise<string> {
  if (!boss) throw new Error('queue not started');
  const jobId = await boss.publish(jobName, { kind, payload, correlationId });
  await upsertResult(jobId as string, 'queued');
  return jobId as string;
}

export async function getTaskStatus(id: string) {
  const { rows } = await pool.query('select id, status, result, error from task_results where id = $1', [id]);
  return rows[0];
}

async function upsertResult(id: string, status: TaskStatus, result: any = null, error: string | null = null) {
  await pool.query(
    `insert into task_results (id, status, result, error)
     values ($1, $2, $3, $4)
     on conflict (id) do update set status = excluded.status, result = excluded.result, error = excluded.error, updated_at = now()`,
    [id, status, result ? JSON.stringify(result) : null, error]
  );
}
