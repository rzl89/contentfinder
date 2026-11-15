-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — TENANT ISOLATION
-- ============================================================================

-- Enable RLS on all tenant-isolated tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_context_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_bibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_generation_jobs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Users can only read and update their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Projects: Strict ownership
DROP POLICY IF EXISTS "Users can manage own projects" ON projects;
CREATE POLICY "Users can manage own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Project Context Profiles: Access based on parent project ownership
DROP POLICY IF EXISTS "Users can manage own project context" ON project_context_profiles;
CREATE POLICY "Users can manage own project context"
  ON project_context_profiles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = project_context_profiles.project_id AND projects.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = project_context_profiles.project_id AND projects.user_id = auth.uid()
  ));

-- 4. Content Ideas: Ownership check
DROP POLICY IF EXISTS "Users can manage own ideas" ON ideas;
CREATE POLICY "Users can manage own ideas"
  ON ideas FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Characters & World Bibles: Project ownership check
DROP POLICY IF EXISTS "Users can manage characters of own projects" ON characters;
CREATE POLICY "Users can manage characters of own projects"
  ON characters FOR ALL
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = characters.project_id AND projects.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = characters.project_id AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can manage world bibles of own projects" ON world_bibles;
CREATE POLICY "Users can manage world bibles of own projects"
  ON world_bibles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = world_bibles.project_id AND projects.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = world_bibles.project_id AND projects.user_id = auth.uid()
  ));

-- 6. Scenes & Prompt Versions: Project ownership check
DROP POLICY IF EXISTS "Users can manage scenes of own projects" ON scenes;
CREATE POLICY "Users can manage scenes of own projects"
  ON scenes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = scenes.project_id AND projects.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = scenes.project_id AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can manage prompt versions of own projects" ON prompt_versions;
CREATE POLICY "Users can manage prompt versions of own projects"
  ON prompt_versions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM scenes JOIN projects ON projects.id = scenes.project_id
    WHERE scenes.id = prompt_versions.scene_id AND projects.user_id = auth.uid()
  ));

-- 7. Provider Credentials: High security isolation
DROP POLICY IF EXISTS "Users can manage own credentials" ON provider_credentials;
CREATE POLICY "Users can manage own credentials"
  ON provider_credentials FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. Video Generation Jobs: Ownership check
DROP POLICY IF EXISTS "Users can view and manage own video jobs" ON video_generation_jobs;
CREATE POLICY "Users can view and manage own video jobs"
  ON video_generation_jobs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 9. Trend Observations: Public read-only
ALTER TABLE trend_observations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read for verified trends" ON trend_observations;
CREATE POLICY "Public read for verified trends"
  ON trend_observations FOR SELECT
  USING (true);
