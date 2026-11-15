-- ============================================================================
-- TEMPORAFORGE AI — POSTGRESQL PRODUCTION SCHEMA
-- ============================================================================

-- 1. User Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'studio')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category_id TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed')),
  target_model TEXT DEFAULT 'universal-neutral',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Project Context Profiles
CREATE TABLE IF NOT EXISTS project_context_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  preset TEXT NOT NULL DEFAULT 'indonesia_natural',
  target_market TEXT NOT NULL DEFAULT 'Indonesia',
  environment TEXT NOT NULL DEFAULT 'mixed',
  visual_style TEXT NOT NULL DEFAULT 'cinematic_realistic',
  dialog_language TEXT NOT NULL DEFAULT 'indonesian',
  caption_language TEXT NOT NULL DEFAULT 'indonesian',
  prompt_language TEXT NOT NULL DEFAULT 'en',
  localization JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Content Ideas
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  hook TEXT NOT NULL,
  premise TEXT NOT NULL,
  synopsis TEXT NOT NULL,
  story_beats JSONB NOT NULL DEFAULT '[]'::jsonb,
  conflict TEXT,
  ending TEXT,
  estimated_duration TEXT NOT NULL,
  visual_style TEXT NOT NULL,
  suggested_location TEXT,
  localization_notes TEXT,
  creative_rationale TEXT,
  trend_evidence TEXT,
  category_id TEXT NOT NULL,
  subcategory_id TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Character Bibles
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INT,
  gender TEXT,
  appearance TEXT NOT NULL,
  clothing TEXT NOT NULL,
  personality TEXT NOT NULL,
  role TEXT NOT NULL,
  backstory TEXT,
  voice_style TEXT,
  photo_reference_url TEXT,
  consistency_anchors JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. World Bibles
CREATE TABLE IF NOT EXISTS world_bibles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  environment_type TEXT NOT NULL,
  description TEXT NOT NULL,
  time_of_day TEXT,
  weather TEXT,
  props JSONB DEFAULT '[]'::jsonb,
  rules JSONB DEFAULT '[]'::jsonb,
  mood_and_tone TEXT,
  color_palette JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Storyboard Scenes
CREATE TABLE IF NOT EXISTS scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  scene_number INT NOT NULL,
  beat_title TEXT NOT NULL,
  purpose TEXT,
  summary TEXT NOT NULL,
  location JSONB NOT NULL DEFAULT '{}'::jsonb,
  character_actions TEXT,
  props JSONB DEFAULT '[]'::jsonb,
  dialogue TEXT,
  narration TEXT,
  camera JSONB NOT NULL DEFAULT '{}'::jsonb,
  lighting TEXT,
  continuity_anchors JSONB DEFAULT '[]'::jsonb,
  image_prompt TEXT NOT NULL,
  video_prompt TEXT NOT NULL,
  negative_prompt TEXT NOT NULL,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, scene_number)
);

-- 8. Prompt Versions (Audit trail)
CREATE TABLE IF NOT EXISTS prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  target_model TEXT NOT NULL,
  image_prompt TEXT NOT NULL,
  video_prompt TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. BYOK Provider Credentials (Encrypted at Rest)
CREATE TABLE IF NOT EXISTS provider_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  masked_suffix TEXT NOT NULL,
  iv TEXT NOT NULL,
  auth_tag TEXT NOT NULL,
  encrypted_data TEXT NOT NULL,
  encrypted_data_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  UNIQUE(user_id, provider)
);

-- 10. Video Generation Jobs
CREATE TABLE IF NOT EXISTS video_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  scene_number INT NOT NULL,
  model_id TEXT NOT NULL,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'submitted', 'processing', 'succeeded', 'failed', 'cancelled', 'expired')),
  provider_job_id TEXT,
  output_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Trend Observations
CREATE TABLE IF NOT EXISTS trend_observations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  platform TEXT NOT NULL,
  region TEXT NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL,
  source_url TEXT NOT NULL,
  format TEXT NOT NULL,
  evidence TEXT NOT NULL,
  status TEXT NOT NULL,
  category_relevance JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Indexes for high-performance querying
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_scenes_project_id ON scenes(project_id);
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_creds_user ON provider_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_video_jobs_user ON video_generation_jobs(user_id);
