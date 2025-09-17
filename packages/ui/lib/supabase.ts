import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time or if env vars are missing, return a mock client
    // This prevents build failures while still maintaining type safety
    return createBrowserClient('http://localhost:54321', 'mock-key');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createClient();
