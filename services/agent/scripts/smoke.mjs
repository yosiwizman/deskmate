// Simple smoke test: /healthz, enqueue a task, poll until completed
// Usage: BASE_URL=https://your-agent.railway.app node scripts/smoke.mjs

const base = process.env.BASE_URL || 'http://127.0.0.1:3001';

async function main() {
  const health = await (await fetch(base + '/healthz')).json();
  if (!health?.ok) throw new Error('health failed: ' + JSON.stringify(health));
  console.log('health ok', health);

  const enqueueRes = await fetch(base + '/api/tasks', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ kind: 'summarize', payload: { text: 'hello world from smoke test' } })
  });
  if (!enqueueRes.ok) throw new Error('enqueue failed: ' + enqueueRes.status);
  const { id, correlationId } = await enqueueRes.json();
  console.log('enqueued', { id, correlationId });

  let status;
  const start = Date.now();
  do {
    await new Promise(r => setTimeout(r, 1000));
    const res = await fetch(base + '/api/tasks/' + id);
    if (!res.ok) throw new Error('status failed: ' + res.status);
    status = await res.json();
    process.stdout.write('.');
  } while (status.status && !['completed', 'failed'].includes(status.status) && Date.now() - start < 20000);
  console.log('\nstatus', status);
  if (status.status !== 'completed') throw new Error('task not completed');
}

main().catch(err => { console.error(err); process.exit(1); });
