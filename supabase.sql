-- FrameStudio Dashboard — Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CLIENTS
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  business text NOT NULL DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  whatsapp text DEFAULT '',
  live_url text,
  supabase_project text,
  vercel_dashboard text,
  github_repo text,
  project_status text NOT NULL DEFAULT 'planning',
  invoice_status text NOT NULL DEFAULT 'pending',
  project_value bigint NOT NULL DEFAULT 0,
  what_was_built text DEFAULT '',
  stage text NOT NULL DEFAULT 'discovery',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. LINKS
CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_name text NOT NULL,
  live_url text,
  supabase_project text,
  vercel_dashboard text,
  github_repo text,
  notes text DEFAULT '',
  category text NOT NULL DEFAULT 'client-sites',
  favourite boolean NOT NULL DEFAULT false,
  tags jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. INCOME
CREATE TABLE IF NOT EXISTS income (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_name text NOT NULL,
  amount bigint NOT NULL,
  description text DEFAULT '',
  date date NOT NULL,
  payment_method text NOT NULL DEFAULT 'M-Pesa',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  amount bigint NOT NULL,
  category text NOT NULL DEFAULT 'Hosting',
  date date NOT NULL,
  payment_method text NOT NULL DEFAULT 'M-Pesa',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_name text NOT NULL,
  amount bigint NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  issued date,
  due date,
  paid_at date,
  description text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. FOCUS ITEMS
CREATE TABLE IF NOT EXISTS focus_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  project text,
  completed boolean NOT NULL DEFAULT false,
  priority text NOT NULL DEFAULT 'medium',
  due_date date,
  status text NOT NULL DEFAULT 'todo',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. KEEL SHOPS
CREATE TABLE IF NOT EXISTS keel_shops (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  plan text NOT NULL DEFAULT 'starter',
  revenue bigint NOT NULL DEFAULT 0,
  owner text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. KEEL APPROVALS
CREATE TABLE IF NOT EXISTS keel_approvals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_name text NOT NULL,
  owner text DEFAULT '',
  plan text NOT NULL DEFAULT 'starter',
  status text NOT NULL DEFAULT 'pending',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 9. KEEL ACTIVITY LOG
CREATE TABLE IF NOT EXISTS keel_activity_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  action text NOT NULL,
  shop text NOT NULL,
  detail text DEFAULT '',
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- 10. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL DEFAULT 'generic',
  message text NOT NULL,
  link text DEFAULT '/',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =====================
-- ROW LEVEL SECURITY
-- =====================

-- Enable RLS on user-owned tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Keel tables are shared (not user-specific)
ALTER TABLE keel_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE keel_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE keel_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for user-owned tables
CREATE POLICY "Users own their clients" ON clients
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users own their links" ON links
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users own their income" ON income
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users own their expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users own their invoices" ON invoices
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users own their focus items" ON focus_items
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users own their notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Keel tables: allow all authenticated users to read/write
CREATE POLICY "Authenticated users can read keel_shops" ON keel_shops
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can write keel_shops" ON keel_shops
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read keel_approvals" ON keel_approvals
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can write keel_approvals" ON keel_approvals
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read keel_activity_log" ON keel_activity_log
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can write keel_activity_log" ON keel_activity_log
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- =====================
-- SEED DATA
-- =====================

-- Insert sample clients (replace user_id with your actual user id later)
-- You can also add data through the app after signing in.
