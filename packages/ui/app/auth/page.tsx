"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';

export default function AuthPage(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [mode,setMode]=useState<'signin'|'signup'>('signin');
  const [msg,setMsg]=useState<string>();
  const [busy,setBusy]=useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const s = createClient();

  const submit=async()=>{
    if(busy) return; setBusy(true); setMsg(undefined);
    try{
      if(mode==='signin'){
        const { error } = await s.auth.signInWithPassword({ email, password });
        if(error) throw error;
        window.location.href = redirect;
      } else {
        const { error } = await s.auth.signUp({ email, password });
        if(error) throw error;
        setMsg('Check your email to confirm, then sign in.');
      }
    }catch(e:any){ setMsg(e.message || 'Failed'); }
    finally{ setBusy(false); }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-3">
        <h1 className="text-2xl font-semibold text-center">DeskMate AI</h1>
        {msg && <div className="text-sm">{msg}</div>}
        <input className="w-full border p-2 rounded" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full border p-2 rounded" onClick={submit} disabled={busy}>{busy?'Working…':(mode==='signin'?'Sign in':'Sign up')}</button>
        <button className="w-full underline text-sm" onClick={()=>setMode(mode==='signin'?'signup':'signin')}>
          {mode==='signin'?'Create an account':'Have an account? Sign in'}
        </button>
      </div>
    </main>
  );
}
