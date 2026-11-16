-- ============================================================================
-- CONTENTFINDER — INITIAL SCHEMA BASELINE
-- Versioned from the live production catalog snapshot on 2026-11-16.
-- The DDL uses IF NOT EXISTS to be safe when reconciled against the already
-- provisioned production schema. It creates no application data.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  display_name text,
  avatar_url text,
  plan_tier text DEFAULT 'free'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  subscription_status text DEFAULT 'trial'::text,
  trial_started_at timestamp with time zone DEFAULT now(),
  subscription_expires_at timestamp with time zone,
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_plan_tier_check CHECK (plan_tier = ANY (ARRAY['free'::text, 'pro'::text, 'studio'::text])),
  CONSTRAINT profiles_subscription_status_check CHECK (subscription_status = ANY (ARRAY['trial'::text, 'active'::text, 'expired'::text]))
);

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  category_id text NOT NULL,
  status text DEFAULT 'draft'::text,
  target_model text DEFAULT 'universal-neutral'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_status_check CHECK (status = ANY (ARRAY['draft'::text, 'in_progress'::text, 'completed'::text])),
  CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.project_context_profiles (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  project_id uuid NOT NULL,
  preset text DEFAULT 'indonesia_natural'::text NOT NULL,
  target_market text DEFAULT 'Indonesia'::text NOT NULL,
  environment text DEFAULT 'mixed'::text NOT NULL,
  visual_style text DEFAULT 'cinematic_realistic'::text NOT NULL,
  dialog_language text DEFAULT 'indonesian'::text NOT NULL,
  caption_language text DEFAULT 'indonesian'::text NOT NULL,
  prompt_language text DEFAULT 'en'::text NOT NULL,
  localization jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT project_context_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT project_context_profiles_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT project_context_profiles_project_id_key UNIQUE (project_id)
);

CREATE TABLE IF NOT EXISTS public.ideas (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  project_id uuid,
  user_id uuid NOT NULL,
  title text NOT NULL,
  hook text NOT NULL,
  premise text NOT NULL,
  synopsis text NOT NULL,
  story_beats jsonb DEFAULT '[]'::jsonb NOT NULL,
  conflict text,
  ending text,
  estimated_duration text NOT NULL,
  visual_style text NOT NULL,
  suggested_location text,
  localization_notes text,
  creative_rationale text,
  trend_evidence text,
  category_id text NOT NULL,
  subcategory_id text,
  is_favorite boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ideas_pkey PRIMARY KEY (id),
  CONSTRAINT ideas_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT ideas_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.characters (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  project_id uuid NOT NULL,
  name text NOT NULL,
  age integer,
  gender text,
  appearance text NOT NULL,
  clothing text NOT NULL,
  personality text NOT NULL,
  role text NOT NULL,
  backstory text,
  voice_style text,
  photo_reference_url text,
  consistency_anchors jsonb DEFAULT '[]'::jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT characters_pkey PRIMARY KEY (id),
  CONSTRAINT characters_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.world_bibles (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  project_id uuid NOT NULL,
  name text NOT NULL,
  environment_type text NOT NULL,
  description text NOT NULL,
  time_of_day text,
  weather text,
  props jsonb DEFAULT '[]'::jsonb,
  rules jsonb DEFAULT '[]'::jsonb,
  mood_and_tone text,
  color_palette jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT world_bibles_pkey PRIMARY KEY (id),
  CONSTRAINT world_bibles_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT world_bibles_project_id_key UNIQUE (project_id)
);

CREATE TABLE IF NOT EXISTS public.scenes (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  project_id uuid NOT NULL,
  scene_number integer NOT NULL,
  beat_title text NOT NULL,
  purpose text,
  summary text NOT NULL,
  location jsonb DEFAULT '{}'::jsonb NOT NULL,
  character_actions text,
  props jsonb DEFAULT '[]'::jsonb,
  dialogue text,
  narration text,
  camera jsonb DEFAULT '{}'::jsonb NOT NULL,
  lighting text,
  continuity_anchors jsonb DEFAULT '[]'::jsonb,
  image_prompt text NOT NULL,
  video_prompt text NOT NULL,
  negative_prompt text NOT NULL,
  is_locked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT scenes_pkey PRIMARY KEY (id),
  CONSTRAINT scenes_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT scenes_project_id_scene_number_key UNIQUE (project_id, scene_number)
);

CREATE TABLE IF NOT EXISTS public.prompt_versions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  scene_id uuid NOT NULL,
  target_model text NOT NULL,
  image_prompt text NOT NULL,
  video_prompt text NOT NULL,
  version integer DEFAULT 1 NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT prompt_versions_pkey PRIMARY KEY (id),
  CONSTRAINT prompt_versions_scene_id_fkey FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.provider_credentials (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  provider text NOT NULL,
  masked_suffix text NOT NULL,
  iv text NOT NULL,
  auth_tag text NOT NULL,
  encrypted_data text NOT NULL,
  encrypted_data_key text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  last_used_at timestamp with time zone,
  CONSTRAINT provider_credentials_pkey PRIMARY KEY (id),
  CONSTRAINT provider_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT provider_credentials_user_id_provider_key UNIQUE (user_id, provider)
);

CREATE TABLE IF NOT EXISTS public.video_generation_jobs (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  project_id uuid NOT NULL,
  scene_number integer NOT NULL,
  model_id text NOT NULL,
  status text DEFAULT 'queued'::text,
  provider_job_id text,
  output_url text,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT video_generation_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT video_generation_jobs_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT video_generation_jobs_status_check CHECK (status = ANY (ARRAY['queued'::text, 'submitted'::text, 'processing'::text, 'succeeded'::text, 'failed'::text, 'cancelled'::text, 'expired'::text])),
  CONSTRAINT video_generation_jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.trend_observations (
  id text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  platform text NOT NULL,
  region text NOT NULL,
  observed_at timestamp with time zone NOT NULL,
  source_url text NOT NULL,
  format text NOT NULL,
  evidence text NOT NULL,
  status text NOT NULL,
  category_relevance jsonb DEFAULT '[]'::jsonb NOT NULL,
  CONSTRAINT trend_observations_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.subscription_orders (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid,
  invoice_number text NOT NULL,
  plan_tier text NOT NULL,
  billing_cycle text NOT NULL,
  amount integer NOT NULL,
  unique_code integer NOT NULL,
  total_amount integer NOT NULL,
  payment_method text NOT NULL,
  status text DEFAULT 'pending'::text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subscription_orders_billing_cycle_check CHECK (billing_cycle = ANY (ARRAY['monthly'::text, 'yearly'::text])),
  CONSTRAINT subscription_orders_invoice_number_key UNIQUE (invoice_number),
  CONSTRAINT subscription_orders_pkey PRIMARY KEY (id),
  CONSTRAINT subscription_orders_plan_tier_check CHECK (plan_tier = ANY (ARRAY['pro'::text, 'studio'::text])),
  CONSTRAINT subscription_orders_status_check CHECK (status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text])),
  CONSTRAINT subscription_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Existing non-constraint indexes captured from production.
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON public.ideas USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_provider_creds_user ON public.provider_credentials USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_scenes_project_id ON public.scenes USING btree (project_id);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_inv ON public.subscription_orders USING btree (invoice_number);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_user ON public.subscription_orders USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_video_jobs_user ON public.video_generation_jobs USING btree (user_id);

-- Ensure all existing application tables have RLS enabled before any grants
-- or policies are applied by the subsequent security migration.
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

-- The next security migration revokes direct execution of this function.
-- The event trigger itself is platform/privilege-managed and is not recreated
-- here; all application tables above have explicit RLS enablement.
CREATE OR REPLACE FUNCTION public.rls_auto_enable()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
  tbl name;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
    IF cmd.schema_name IS NOT NULL
       AND cmd.schema_name IN ('public')
       AND cmd.schema_name NOT IN ('pg_catalog','information_schema')
       AND cmd.schema_name NOT LIKE 'pg_toast%'
       AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        SELECT c.relname INTO tbl
        FROM pg_catalog.pg_class c
        WHERE c.oid = cmd.objid;
        EXECUTE format(
          'alter table if exists %I.%I enable row level security',
          cmd.schema_name, tbl
        );
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
    ELSE
      RAISE LOG 'rls_auto_enable: skip % (schema: %)',
        cmd.object_identity, cmd.schema_name;
    END IF;
  END LOOP;
END;
$function$;
