import type { Request } from 'express';

const PROVIDER = process.env.PRIMARY_LLM || 'anthropic';
const MODEL = process.env.PRIMARY_LLM_MODEL || 'claude-3-5-sonnet-20240620';
const API_KEY = process.env.PRIMARY_LLM_API_KEY || '';

export async function runTask(kind: string, payload: any, correlationId?: string) {
  // Fallback if no key: deterministic local behavior
  if (!API_KEY || PROVIDER !== 'anthropic') {
    return fallback(kind, payload);
  }

  try {
    switch (kind) {
      case 'summarize':
        return await callAnthropic(`Summarize briefly:\n\n${payload?.text ?? JSON.stringify(payload)}`);
      case 'draft_email':
        return await callAnthropic(`Draft a short, professional email about:\n\n${payload?.topic ?? JSON.stringify(payload)}`);
      case 'checklist':
        return await callAnthropic(`Create a concise checklist for:\n\n${payload?.topic ?? JSON.stringify(payload)}`);
      case 'extract_contacts':
        return await callAnthropic(`Extract any contacts (name, email, phone) from:\n\n${payload?.text ?? JSON.stringify(payload)}`);
      default:
        return await callAnthropic(`You are a helpful assistant. Task kind: ${kind}. Input: ${JSON.stringify(payload)}`);
    }
  } catch (err: any) {
    // If the API fails, degrade to fallback so jobs still complete
    return fallback(kind, payload, err?.message);
  }
}

async function callAnthropic(prompt: string) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic error: ${res.status} ${text}`);
  }
  const data = await res.json();
  // Messages API returns { content: [{type:'text', text: '...'}] }
  const output = Array.isArray(data?.content) && data.content[0]?.text ? data.content[0].text : JSON.stringify(data);
  return { provider: PROVIDER, model: MODEL, output };
}

function fallback(kind: string, payload: any, note?: string) {
  const text = (payload?.text || payload?.topic || JSON.stringify(payload || {})) as string;
  const words = String(text).split(/\s+/).filter(Boolean);
  let output: string;
  switch (kind) {
    case 'summarize':
      output = words.slice(0, 24).join(' ') + (words.length > 24 ? '…' : '');
      break;
    case 'draft_email':
      output = `Hi there,\n\n${words.slice(0, 40).join(' ')}.\n\nBest regards,\nAgent`;
      break;
    case 'checklist':
      output = ['- Step 1', '- Step 2', '- Step 3'].join('\n');
      break;
    case 'extract_contacts':
      output = '[]'; // simple placeholder
      break;
    default:
      output = `echo: ${text}`;
  }
  return { provider: 'fallback', model: 'local', output, note };
}
