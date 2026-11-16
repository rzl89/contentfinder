-- ============================================================================
-- CONTENTFINDER — ROW LEVEL SECURITY AND CLIENT PRIVILEGES
-- Source of truth: production policies/grants after hardening on 2026-11-16.
-- Re-running this script replaces the named application policies.
-- ============================================================================
-- Lock all browser roles out first; grants below are explicit allow-lists.
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC, anon, authenticated;


-- Restrict future objects created by the application schema owner as well.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL PRIVILEGES ON TABLES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL PRIVILEGES ON SEQUENCES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;

-- A SECURITY DEFINER helper must not be a callable browser RPC endpoint.
REVOKE ALL PRIVILEGES ON FUNCTION public.rls_auto_enable()
  FROM PUBLIC, anon, authenticated;

-- Enable RLS on every application table.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_context_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_bibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_orders ENABLE ROW LEVEL SECURITY;

-- User-owned content: CRUD is granted to authenticated; row ownership is enforced below.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.projects,
  public.project_context_profiles,
  public.ideas,
  public.characters,
  public.world_bibles,
  public.scenes,
  public.prompt_versions
TO authenticated;

-- Profile data: entitlements and identity cannot be changed directly by clients.
GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT INSERT (id, display_name, avatar_url) ON TABLE public.profiles TO authenticated;
GRANT UPDATE (display_name, avatar_url) ON TABLE public.profiles TO authenticated;

-- Public reference data and read-only user resources.
GRANT SELECT ON TABLE public.trend_observations TO anon, authenticated;
GRANT SELECT ON TABLE public.video_generation_jobs, public.subscription_orders TO authenticated;

-- Provider credentials remain server-only.
REVOKE ALL PRIVILEGES ON TABLE public.provider_credentials FROM PUBLIC, anon, authenticated;

-- Profiles.
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id);

-- Projects.
DROP POLICY IF EXISTS "Users can manage own projects" ON public.projects;
CREATE POLICY "Users can manage own projects" ON public.projects
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Project context.
DROP POLICY IF EXISTS "Users can manage own project context" ON public.project_context_profiles;
CREATE POLICY "Users can manage own project context" ON public.project_context_profiles
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_context_profiles.project_id
      AND projects.user_id = (SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_context_profiles.project_id
      AND projects.user_id = (SELECT auth.uid())
  ));

-- Ideas: project-less ideas are allowed, but linked ideas must belong to the caller's project.
DROP POLICY IF EXISTS "Users can manage own ideas" ON public.ideas;
CREATE POLICY "Users can manage own ideas" ON public.ideas
  FOR ALL TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    AND (
      project_id IS NULL OR EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = ideas.project_id
          AND projects.user_id = (SELECT auth.uid())
      )
    )
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND (
      project_id IS NULL OR EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = ideas.project_id
          AND projects.user_id = (SELECT auth.uid())
      )
    )
  );

-- Character and world bible ownership through the parent project.
DROP POLICY IF EXISTS "Users can manage characters of own projects" ON public.characters;
CREATE POLICY "Users can manage characters of own projects" ON public.characters
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = characters.project_id
      AND projects.user_id = (SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = characters.project_id
      AND projects.user_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "Users can manage world bibles of own projects" ON public.world_bibles;
CREATE POLICY "Users can manage world bibles of own projects" ON public.world_bibles
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = world_bibles.project_id
      AND projects.user_id = (SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = world_bibles.project_id
      AND projects.user_id = (SELECT auth.uid())
  ));

-- Scenes and prompt versions.
DROP POLICY IF EXISTS "Users can manage scenes of own projects" ON public.scenes;
CREATE POLICY "Users can manage scenes of own projects" ON public.scenes
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = scenes.project_id
      AND projects.user_id = (SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = scenes.project_id
      AND projects.user_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "Users can manage prompt versions of own projects" ON public.prompt_versions;
CREATE POLICY "Users can manage prompt versions of own projects" ON public.prompt_versions
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.scenes
    JOIN public.projects ON projects.id = scenes.project_id
    WHERE scenes.id = prompt_versions.scene_id
      AND projects.user_id = (SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.scenes
    JOIN public.projects ON projects.id = scenes.project_id
    WHERE scenes.id = prompt_versions.scene_id
      AND projects.user_id = (SELECT auth.uid())
  ));

-- Provider credentials: explicit deny; privileged server code is the only access path.
DROP POLICY IF EXISTS "Users can manage own credentials" ON public.provider_credentials;
DROP POLICY IF EXISTS "No direct client access to provider credentials" ON public.provider_credentials;
CREATE POLICY "No direct client access to provider credentials" ON public.provider_credentials
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

-- Video jobs are owner-readable; creation and status changes are server-managed.
DROP POLICY IF EXISTS "Users can view and manage own video jobs" ON public.video_generation_jobs;
DROP POLICY IF EXISTS "Users can view own video jobs" ON public.video_generation_jobs;
CREATE POLICY "Users can view own video jobs" ON public.video_generation_jobs
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

-- Subscription orders are owner-readable; creation and verification are server-managed.
DROP POLICY IF EXISTS "Users can view own subscription orders" ON public.subscription_orders;
CREATE POLICY "Users can view own subscription orders" ON public.subscription_orders
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can create own subscription orders" ON public.subscription_orders;

-- Trend observations are intentionally public and read-only.
DROP POLICY IF EXISTS "Public read for verified trends" ON public.trend_observations;
CREATE POLICY "Public read for verified trends" ON public.trend_observations
  FOR SELECT TO anon, authenticated USING (true);
