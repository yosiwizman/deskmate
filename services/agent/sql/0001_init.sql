CREATE TABLE IF NOT EXISTS task_results (
  id uuid PRIMARY KEY,
  status text NOT NULL,
  result jsonb,
  error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
