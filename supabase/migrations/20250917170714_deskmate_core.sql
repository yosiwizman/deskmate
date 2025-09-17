-- DeskMate Core Tables Migration
-- This migration is idempotent and safe to run multiple times

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name text,
    email text UNIQUE NOT NULL,
    avatar_url text,
    created_at timestamptz DEFAULT now()
);

-- Create files table  
CREATE TABLE IF NOT EXISTS public.files (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    path text NOT NULL,
    name text NOT NULL,
    size bigint NOT NULL DEFAULT 0,
    mime text,
    sha256 text,
    created_at timestamptz DEFAULT now()
);

-- Create task_presets table
CREATE TABLE IF NOT EXISTS public.task_presets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    fields jsonb DEFAULT '{}',
    prompt text,
    created_at timestamptz DEFAULT now()
);

-- Create workspace_sessions table
CREATE TABLE IF NOT EXISTS public.workspace_sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    files jsonb DEFAULT '[]',
    last_task_id text,
    desktop_id text,
    version int DEFAULT 1,
    updated_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Create hidden_tasks table
CREATE TABLE IF NOT EXISTS public.hidden_tasks (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id text NOT NULL,
    hidden_at timestamptz DEFAULT now(),
    PRIMARY KEY (user_id, task_id)
);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS public.audit_log (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action text NOT NULL,
    meta jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.task_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hidden_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for files table
DROP POLICY IF EXISTS "Users can view own files" ON public.files;
CREATE POLICY "Users can view own files" ON public.files
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own files" ON public.files;
CREATE POLICY "Users can insert own files" ON public.files
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own files" ON public.files;
CREATE POLICY "Users can update own files" ON public.files
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own files" ON public.files;
CREATE POLICY "Users can delete own files" ON public.files
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for task_presets table
DROP POLICY IF EXISTS "Users can view own task_presets" ON public.task_presets;
CREATE POLICY "Users can view own task_presets" ON public.task_presets
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own task_presets" ON public.task_presets;
CREATE POLICY "Users can insert own task_presets" ON public.task_presets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own task_presets" ON public.task_presets;
CREATE POLICY "Users can update own task_presets" ON public.task_presets
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own task_presets" ON public.task_presets;
CREATE POLICY "Users can delete own task_presets" ON public.task_presets
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for workspace_sessions table
DROP POLICY IF EXISTS "Users can view own workspace_sessions" ON public.workspace_sessions;
CREATE POLICY "Users can view own workspace_sessions" ON public.workspace_sessions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own workspace_sessions" ON public.workspace_sessions;
CREATE POLICY "Users can insert own workspace_sessions" ON public.workspace_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own workspace_sessions" ON public.workspace_sessions;
CREATE POLICY "Users can update own workspace_sessions" ON public.workspace_sessions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own workspace_sessions" ON public.workspace_sessions;
CREATE POLICY "Users can delete own workspace_sessions" ON public.workspace_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for hidden_tasks table
DROP POLICY IF EXISTS "Users can view own hidden_tasks" ON public.hidden_tasks;
CREATE POLICY "Users can view own hidden_tasks" ON public.hidden_tasks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own hidden_tasks" ON public.hidden_tasks;
CREATE POLICY "Users can insert own hidden_tasks" ON public.hidden_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own hidden_tasks" ON public.hidden_tasks;
CREATE POLICY "Users can update own hidden_tasks" ON public.hidden_tasks
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own hidden_tasks" ON public.hidden_tasks;
CREATE POLICY "Users can delete own hidden_tasks" ON public.hidden_tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for audit_log table
DROP POLICY IF EXISTS "Users can view own audit_log" ON public.audit_log;
CREATE POLICY "Users can view own audit_log" ON public.audit_log
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own audit_log" ON public.audit_log;
CREATE POLICY "Users can insert own audit_log" ON public.audit_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own audit_log" ON public.audit_log;
CREATE POLICY "Users can update own audit_log" ON public.audit_log
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own audit_log" ON public.audit_log;
CREATE POLICY "Users can delete own audit_log" ON public.audit_log
    FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('uploads-prod', 'uploads-prod', false, 52428800, NULL)
ON CONFLICT (id) DO NOTHING;

-- Helper function for path ownership
CREATE OR REPLACE FUNCTION public.path_is_user_owned(name text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT name LIKE ('user_' || auth.uid()::text || '/%')
$$;

-- Storage policies for uploads-prod bucket
DROP POLICY IF EXISTS "Users can select own files" ON storage.objects;
CREATE POLICY "Users can select own files" ON storage.objects
    FOR SELECT USING (bucket_id = 'uploads-prod' AND public.path_is_user_owned(name));

DROP POLICY IF EXISTS "Users can insert own files" ON storage.objects;
CREATE POLICY "Users can insert own files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'uploads-prod' AND public.path_is_user_owned(name));

DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
CREATE POLICY "Users can update own files" ON storage.objects
    FOR UPDATE USING (bucket_id = 'uploads-prod' AND public.path_is_user_owned(name));

DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
CREATE POLICY "Users can delete own files" ON storage.objects
    FOR DELETE USING (bucket_id = 'uploads-prod' AND public.path_is_user_owned(name));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_files_user_id_created_at ON public.files(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_presets_user_id ON public.task_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_sessions_user_id ON public.workspace_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id_created_at ON public.audit_log(user_id, created_at DESC);

-- Add updated_at trigger for workspace_sessions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_workspace_sessions_updated_at ON public.workspace_sessions;
CREATE TRIGGER update_workspace_sessions_updated_at
    BEFORE UPDATE ON public.workspace_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();