import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const base = process.env.TASK_API_BASE;
  if (!base) {
    return NextResponse.json({ id, status: 'queued', note: 'TASK_API_BASE not configured' }, { status: 200 });
  }
  const url = `${base.replace(/\/$/, '')}/tasks/${encodeURIComponent(id)}`;
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
  const body = await res.json().catch(() => ({}));
  return NextResponse.json(body, { status: res.status });
}
