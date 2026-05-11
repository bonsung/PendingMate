-- PendingMate Supabase Schema

CREATE TABLE IF NOT EXISTS tasks (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  content text,
  pic_id bigint,
  status text DEFAULT 'ongoing',
  validity_date timestamptz,
  priority text DEFAULT 'normal',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS pics (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  role text,
  email text,
  phone text,
  memo text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE pics DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS attachments (
  id bigserial PRIMARY KEY,
  task_id bigint,
  type text,
  name text,
  url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE attachments DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text
);
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
