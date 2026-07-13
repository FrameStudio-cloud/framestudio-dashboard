-- Migration: Add schema_diagrams table for persisting flow/database diagrams
-- Apply via Supabase Dashboard → SQL Editor or run:
--   npx supabase db query --linked --file supabase/migrations/20260713_add_schema_diagrams.sql
-- Requires SUPABASE_DB_PASSWORD env var for CLI, or use the Dashboard SQL Editor.

CREATE TABLE IF NOT EXISTS public.schema_diagrams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  diagram_id text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  diagram_type text NOT NULL DEFAULT 'database',
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint: one custom copy of each diagram_id per user
ALTER TABLE public.schema_diagrams
  ADD CONSTRAINT schema_diagrams_user_diagram_unique
  UNIQUE (user_id, diagram_id);

ALTER TABLE public.schema_diagrams ENABLE ROW LEVEL SECURITY;

-- Users can CRUD only their own diagrams
CREATE POLICY "Users can CRUD their own schema diagrams"
  ON public.schema_diagrams FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated role to manage their diagrams
GRANT ALL ON public.schema_diagrams TO authenticated;

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION public.update_schema_diagrams_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_schema_diagrams_updated_at
  BEFORE UPDATE ON public.schema_diagrams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_schema_diagrams_updated_at();
