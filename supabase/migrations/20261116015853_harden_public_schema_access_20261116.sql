-- Restored from the linked production project's applied migration history.
-- Version: 20261116015853
-- Name: harden_public_schema_access_20261116

-- Remove unsafe API-role privileges from current public-schema tables/sequences.
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC, anon, authenticated;

-- User-owned content operations; RLS policies below enforce tenant ownership.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.projects,
  public.project_context_profiles,
  public.ideas,
  public.characters,
  public.world_bibles,
  public.scenes,
  public.prompt_versions
TO authenticated;

-- Profile columns carrying entitlements are deliberately not client-writable.
GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT INSERT (id, display_name, avatar_url) ON TABLE public.profiles TO authenticated;
GRANT UPDATE (display_name, avatar_url) ON TABLE public.profiles TO authenticated;

-- Client-facing read-only tables.
GRANT SELECT ON TABLE public.trend_observations TO anon, authenticated;
GRANT SELECT ON TABLE public.video_generation_jobs, public.subscription_orders TO authenticated;

-- Sensitive records and operational writes stay server-managed.
REVOKE ALL PRIVILEGES ON TABLE public.provider_credentials FROM PUBLIC, anon, authenticated;

-- Replace public policies with explicit authenticated roles and tenant checks.
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can manage own projects" ON public.projects;
CREATE POLICY "Users can manage own projects"
  ON public.projects FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage own project context" ON public.project_context_profiles;
CREATE POLICY "Users can manage own project context"
  ON public.project_context_profiles FOR ALL TO authenticated
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

DROP POLICY IF EXISTS "Users can manage own ideas" ON public.ideas;
CREATE POLICY "Users can manage own ideas"
  ON public.ideas FOR ALL TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    AND (
      project_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = ideas.project_id
          AND projects.user_id = (SELECT auth.uid())
      )
    )
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND (
      project_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = ideas.project_id
          AND projects.user_id = (SELECT auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Users can manage characters of own projects" ON public.characters;
CREATE POLICY "Users can manage characters of own projects"
  ON public.characters FOR ALL TO authenticated
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
CREATE POLICY "Users can manage world bibles of own projects"
  ON public.world_bibles FOR ALL TO authenticated
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

DROP POLICY IF EXISTS "Users can manage scenes of own projects" ON public.scenes;
CREATE POLICY "Users can manage scenes of own projects"
  ON public.scenes FOR ALL TO authenticated
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
CREATE POLICY "Users can manage prompt versions of own projects"
  ON public.prompt_versions FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.scenes
    JOIN public.projects ON projects.id = scenes.project_id
    WHERE scenes.id = prompt_versions.scene_id
      AND projects.user_id = (SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.scenes
    JOIN public.projects ON projects.id = scenes.project_id
    WHERE scenes.id = prompt_versions.scene_id
      AND projects.user_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "Users can manage own credentials" ON public.provider_credentials;

DROP POLICY IF EXISTS "Users can view and manage own video jobs" ON public.video_generation_jobs;
DROP POLICY IF EXISTS "Users can view own video jobs" ON public.video_generation_jobs;
CREATE POLICY "Users can view own video jobs"
  ON public.video_generation_jobs FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own subscription orders" ON public.subscription_orders;
CREATE POLICY "Users can view own subscription orders"
  ON public.subscription_orders FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create own subscription orders" ON public.subscription_orders;

DROP POLICY IF EXISTS "Public read for verified trends" ON public.trend_observations;
CREATE POLICY "Public read for verified trends"
  ON public.trend_observations FOR SELECT TO anon, authenticated
  USING (true);

-- Keep the event trigger registered, but prevent direct API invocation of its function.
REVOKE ALL PRIVILEGES ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
