-- ============================================================================
-- Fixprom — Credit / Point System Migration
-- ============================================================================

-- 1. Tambah kolom kredit pada profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS credits_balance integer NOT NULL DEFAULT 20,
ADD COLUMN IF NOT EXISTS monthly_credits_allowance integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS credits_reset_at timestamp with time zone;

-- Update akun pro yang sudah aktif agar langsung mendapatkan 350 kredit
UPDATE public.profiles
SET 
  credits_balance = 350,
  monthly_credits_allowance = 350,
  credits_reset_at = COALESCE(subscription_expires_at, now() + interval '30 days')
WHERE plan_tier = 'pro' AND subscription_status = 'active';

-- 2. Buat tabel riwayat transaksi kredit
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  balance_after integer NOT NULL,
  action_type text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_tx_user_created ON public.credit_transactions(user_id, created_at DESC);

-- RLS untuk tabel credit_transactions
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'credit_transactions' AND policyname = 'Users can view own credit transactions'
  ) THEN
    CREATE POLICY "Users can view own credit transactions" 
    ON public.credit_transactions 
    FOR SELECT 
    TO authenticated 
    USING ((SELECT auth.uid()) = user_id);
  END IF;
END $$;

GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT ALL ON public.credit_transactions TO service_role;

-- 3. Atomic RPC Function: deduct_user_credits
CREATE OR REPLACE FUNCTION public.deduct_user_credits(
  deduct_amount integer,
  action_name text,
  meta jsonb DEFAULT '{}'::jsonb,
  target_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  uid uuid;
  current_bal integer;
  new_bal integer;
BEGIN
  SET LOCAL row_security = off;

  uid := COALESCE(target_user_id, auth.uid());
  IF uid IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'UNAUTHENTICATED');
  END IF;

  IF deduct_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'INVALID_AMOUNT');
  END IF;

  SELECT credits_balance INTO current_bal
  FROM public.profiles
  WHERE id = uid
  FOR UPDATE;

  IF current_bal IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'USER_NOT_FOUND');
  END IF;

  IF current_bal < deduct_amount THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'INSUFFICIENT_CREDITS', 
      'current_balance', current_bal,
      'required', deduct_amount
    );
  END IF;

  new_bal := current_bal - deduct_amount;

  UPDATE public.profiles
  SET credits_balance = new_bal, updated_at = now()
  WHERE id = uid;

  INSERT INTO public.credit_transactions (
    user_id, amount, balance_after, action_type, description, metadata
  ) VALUES (
    uid, -deduct_amount, new_bal, action_name, 
    format('Penggunaan %s kredit untuk %s', deduct_amount, action_name), meta
  );

  RETURN json_build_object(
    'success', true,
    'deducted', deduct_amount,
    'balance', new_bal
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.deduct_user_credits(integer, text, jsonb, uuid) TO anon, authenticated;

-- 4. Atomic RPC Function: grant_user_credits
CREATE OR REPLACE FUNCTION public.grant_user_credits(
  target_user_id uuid,
  grant_amount integer,
  reason text,
  meta jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  current_bal integer;
  new_bal integer;
BEGIN
  SET LOCAL row_security = off;

  IF grant_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'INVALID_AMOUNT');
  END IF;

  SELECT credits_balance INTO current_bal
  FROM public.profiles
  WHERE id = target_user_id
  FOR UPDATE;

  IF current_bal IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'USER_NOT_FOUND');
  END IF;

  new_bal := current_bal + grant_amount;

  UPDATE public.profiles
  SET credits_balance = new_bal, updated_at = now()
  WHERE id = target_user_id;

  INSERT INTO public.credit_transactions (
    user_id, amount, balance_after, action_type, description, metadata
  ) VALUES (
    target_user_id, grant_amount, new_bal, 'grant_bonus', 
    reason, meta
  );

  RETURN json_build_object(
    'success', true,
    'granted', grant_amount,
    'balance', new_bal
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.grant_user_credits(uuid, integer, text, jsonb) TO anon, authenticated;

-- 5. Perbarui admin_activate_subscription_by_email
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
  assigned_credits integer := 350;
BEGIN
  SET LOCAL row_security = off;

  SELECT id INTO matched_user_id
  FROM auth.users
  WHERE lower(email) = lower(trim(target_email))
  LIMIT 1;

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

  IF new_tier != 'pro' THEN
    assigned_credits := 20;
  END IF;

  INSERT INTO public.profiles (
    id,
    plan_tier,
    subscription_status,
    subscription_expires_at,
    credits_balance,
    monthly_credits_allowance,
    credits_reset_at,
    updated_at
  )
  VALUES (
    matched_user_id,
    new_tier,
    'active',
    expires_at,
    assigned_credits,
    assigned_credits,
    expires_at,
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    plan_tier                 = EXCLUDED.plan_tier,
    subscription_status       = 'active',
    subscription_expires_at   = EXCLUDED.subscription_expires_at,
    credits_balance           = GREATEST(public.profiles.credits_balance, assigned_credits),
    monthly_credits_allowance = assigned_credits,
    credits_reset_at          = EXCLUDED.subscription_expires_at,
    updated_at                = now();

  INSERT INTO public.credit_transactions (
    user_id, amount, balance_after, action_type, description
  ) VALUES (
    matched_user_id, assigned_credits, assigned_credits, 'subscription_grant', 
    format('Alokasi kuota paket %s: %s kredit', upper(new_tier), assigned_credits)
  );

  UPDATE public.subscription_orders
  SET
    status = 'verified',
    updated_at = now()
  WHERE user_id = matched_user_id AND status = 'pending';

  RETURN json_build_object(
    'success',                  true,
    'user_id',                  matched_user_id,
    'email',                    target_email,
    'plan_tier',                new_tier,
    'subscription_status',      'active',
    'subscription_expires_at',  expires_at,
    'credits_balance',          assigned_credits
  );
END;
$$;

DROP FUNCTION IF EXISTS public.admin_list_user_profiles(text, integer);

CREATE OR REPLACE FUNCTION public.admin_list_user_profiles(
  search_query text DEFAULT '',
  limit_count integer DEFAULT 25
)
RETURNS TABLE (
  id uuid,
  email text,
  plan_tier text,
  subscription_status text,
  credits_balance integer,
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
    COALESCE(p.credits_balance, 20)::integer as credits_balance,
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

GRANT EXECUTE ON FUNCTION public.admin_activate_subscription_by_email(text, text, timestamptz) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_user_profiles(text, integer) TO anon, authenticated;
