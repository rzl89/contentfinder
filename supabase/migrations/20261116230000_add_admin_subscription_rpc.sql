-- ============================================================================
-- Fixprom — Admin Subscription Management RPC Functions
-- Migration: 20261116230000_add_admin_subscription_rpc.sql
-- ============================================================================

-- 1. Function to activate/update a user's subscription tier and expiration
CREATE OR REPLACE FUNCTION public.admin_activate_subscription_by_email(
  target_email text,
  new_tier text DEFAULT 'pro',
  expires_at timestamp with time zone DEFAULT (now() + interval '30 days')
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  matched_user_id uuid;
  result jsonb;
BEGIN
  -- 1. Try to find user in auth.users by email
  SELECT id INTO matched_user_id
  FROM auth.users
  WHERE lower(email) = lower(trim(target_email))
  LIMIT 1;

  -- 2. If not found in auth.users, check if target_email is a valid UUID matching profiles.id
  IF matched_user_id IS NULL AND target_email ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    matched_user_id := target_email::uuid;
  END IF;

  IF matched_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'USER_NOT_FOUND',
      'message', format('User dengan email "%s" belum terdaftar di sistem Fixprom.', target_email)
    );
  END IF;

  -- 3. Upsert profile with new tier, active status, and expiration
  INSERT INTO public.profiles (
    id,
    plan_tier,
    subscription_status,
    subscription_expires_at,
    updated_at
  )
  VALUES (
    matched_user_id,
    new_tier,
    'active',
    expires_at,
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    plan_tier = new_tier,
    subscription_status = 'active',
    subscription_expires_at = expires_at,
    updated_at = now();

  -- 4. Mark pending orders for this user as verified if any exist
  UPDATE public.subscription_orders
  SET
    status = 'verified',
    updated_at = now()
  WHERE user_id = matched_user_id AND status = 'pending';

  RETURN json_build_object(
    'success', true,
    'user_id', matched_user_id,
    'email', target_email,
    'plan_tier', new_tier,
    'subscription_status', 'active',
    'subscription_expires_at', expires_at
  );
END;
$$;

-- 2. Function to list registered users and their profile subscription status
CREATE OR REPLACE FUNCTION public.admin_list_user_profiles(
  search_query text DEFAULT '',
  limit_count integer DEFAULT 25
)
RETURNS TABLE (
  id uuid,
  email text,
  plan_tier text,
  subscription_status text,
  subscription_expires_at timestamp with time zone,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT
    u.id,
    u.email::text,
    COALESCE(p.plan_tier, 'free')::text as plan_tier,
    COALESCE(p.subscription_status, 'trial')::text as subscription_status,
    p.subscription_expires_at,
    u.created_at
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE
    search_query = ''
    OR u.email ILIKE '%' || search_query || '%'
  ORDER BY u.created_at DESC
  LIMIT limit_count;
$$;

-- 3. Grant RPC execute privileges to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.admin_activate_subscription_by_email(text, text, timestamp with time zone) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_user_profiles(text, integer) TO anon, authenticated;
