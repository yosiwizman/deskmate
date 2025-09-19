'use client';
import { useState } from 'react';
import { TaskKind } from '@/lib/contracts';
import { withRetry } from '@/lib/retry';

const actions: { key: TaskKind; label: string }[] = [
  { key: 'summarize', label: 'Summarize' },
  { key: 'draft_email', label: 'Draft email' },
  { key: 'checklist', label: 'Create checklist' },
  { key: 'extract_contacts', label: 'Extract contacts' },
];

interface QuickActionsProps {
  onTaskStart?: (kind: TaskKind) => void;
}

export default function QuickActions({ onTaskStart }: QuickActionsProps) {
  const [busy, setBusy] = useState<TaskKind | null>(null);
  const [message, setMessage] = useState<string>('');

  const pollStatus = async (id: string) => {
    let attempts = 0;
    while (attempts < 20) {
      const res = await fetch(`/api/tasks/${id}`);
      if (!res.ok) throw new Error('status failed');
      const data = await res.json();
      if (data?.status === 'completed') {
        const text = data?.result?.output ?? JSON.stringify(data?.result ?? {});
        return `Completed: ${text}`;
      }
      if (data?.status === 'failed') {
        throw new Error(data?.error || 'Task failed');
      }
      await new Promise(r => setTimeout(r, 1000));
      attempts++;
    }
    return 'Still running… you can check later in Activity.';
  };

  const runTask = async (kind: TaskKind) => {
    setBusy(kind);
    setMessage('');
    try {
      const { id } = await withRetry(async () => {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind }),
        });
        if (!response.ok) throw new Error(`Task failed: ${response.statusText}`);
        return response.json();
      });
      setMessage(`Started: ${kind}`);
      onTaskStart?.(kind);
      const doneMsg = await pollStatus(id);
      setMessage(doneMsg);
    } catch (error) {
      setMessage(`Failed to run ${kind}. Try again?`);
      console.error('Task error:', error);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Quick Actions</h3>
      <div className="tasks-grid">
        {actions.map((action) => (
          <button
            key={action.key}
            className="border rounded px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={busy !== null}
            onClick={() => runTask(action.key)}
          >
            {busy === action.key ? 'Working…' : action.label}
          </button>
        ))}
      </div>
      {message && (
        <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded whitespace-pre-wrap">
          {message}
        </div>
      )}
    </div>
  );
}
