import { z } from 'zod';

// Task types
export const TaskKind = z.enum(['summarize', 'draft_email', 'checklist', 'extract_contacts']);
export type TaskKind = z.infer<typeof TaskKind>;

export const TaskRequest = z.object({
  kind: TaskKind,
  prompt: z.string().optional(),
  context: z.any().optional(),
});
export type TaskRequest = z.infer<typeof TaskRequest>;

export const TaskResponse = z.object({
  id: z.string().optional(),
  status: z.string(),
  message: z.string().optional(),
});
export type TaskResponse = z.infer<typeof TaskResponse>;

// File types
export const FileMeta = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  size: z.number(),
  mime: z.string().nullable(),
  created_at: z.string(),
});
export type FileMeta = z.infer<typeof FileMeta>;

// Search types
export const SearchRequest = z.object({
  q: z.string().min(2),
});
export type SearchRequest = z.infer<typeof SearchRequest>;

export const SearchHit = z.object({
  title: z.string().optional(),
  url: z.string().url().optional(),
  content: z.string().optional(),
});
export type SearchHit = z.infer<typeof SearchHit>;

export const SearchResponse = z.object({
  results: z.array(SearchHit),
});
export type SearchResponse = z.infer<typeof SearchResponse>;

// Database types
export const Profile = z.object({
  user_id: z.string(),
  display_name: z.string().nullable(),
  email: z.string().email(),
  avatar_url: z.string().nullable(),
  created_at: z.string(),
});
export type Profile = z.infer<typeof Profile>;

export const TaskPreset = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  fields: z.record(z.any()).default({}),
  prompt: z.string().nullable(),
  created_at: z.string(),
});
export type TaskPreset = z.infer<typeof TaskPreset>;

export const WorkspaceSession = z.object({
  id: z.string(),
  user_id: z.string(),
  files: z.array(z.any()).default([]),
  last_task_id: z.string().nullable(),
  desktop_id: z.string().nullable(),
  version: z.number().default(1),
  updated_at: z.string(),
  created_at: z.string(),
});
export type WorkspaceSession = z.infer<typeof WorkspaceSession>;

// API Response types
export const ApiError = z.object({
  error: z.string(),
  details: z.string().optional(),
});
export type ApiError = z.infer<typeof ApiError>;

export const ApiSuccess = z.object({
  ok: z.boolean(),
  data: z.any().optional(),
});
export type ApiSuccess = z.infer<typeof ApiSuccess>;

// Health check response
export const HealthResponse = z.object({
  ok: z.boolean(),
  name: z.string().optional(),
});
export type HealthResponse = z.infer<typeof HealthResponse>;