-- ============================================================================
-- ADD DIVERSITY, NORMALIZED TEXT & IDEA MEMORY FIELDS TO PUBLIC.IDEAS
-- Additive migration for ContentFinder Creative Diversity Engine
-- ============================================================================

-- Add optional diversity and tracking columns to public.ideas
ALTER TABLE public.ideas
  ADD COLUMN IF NOT EXISTS topic text,
  ADD COLUMN IF NOT EXISTS creative_direction text,
  ADD COLUMN IF NOT EXISTS model_identifier text DEFAULT 'gpt-6-luna'::text,
  ADD COLUMN IF NOT EXISTS normalized_text text;

-- Indexes for high-performance recent idea retrieval per user and category
CREATE INDEX IF NOT EXISTS idx_ideas_user_category ON public.ideas USING btree (user_id, category_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_user_created ON public.ideas USING btree (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_project_created ON public.ideas USING btree (project_id, created_at DESC) WHERE project_id IS NOT NULL;
