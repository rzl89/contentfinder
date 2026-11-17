-- ============================================================================
-- Fixprom — Anti-Abuse Device Fingerprint & Disposable Email Defense
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.device_trial_fingerprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_hash text NOT NULL UNIQUE,
  first_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  first_email text,
  first_ip text,
  trial_claimed_at timestamp with time zone DEFAULT now(),
  is_blocked boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_device_trial_fp_hash ON public.device_trial_fingerprints(device_hash);

ALTER TABLE public.device_trial_fingerprints ENABLE ROW LEVEL SECURITY;

-- Allow anon and authenticated users to call verification RPC
CREATE OR REPLACE FUNCTION public.check_or_register_trial_device(
  p_device_hash text,
  p_email text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing RECORD;
BEGIN
  IF p_device_hash IS NULL OR length(trim(p_device_hash)) < 16 THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'INVALID_DEVICE_FINGERPRINT');
  END IF;

  SELECT * INTO v_existing FROM public.device_trial_fingerprints WHERE device_hash = p_device_hash;

  IF FOUND THEN
    -- Device already claimed trial
    RETURN jsonb_build_object(
      'allowed', false,
      'claimed_at', v_existing.trial_claimed_at,
      'reason', 'DEVICE_ALREADY_USED_TRIAL'
    );
  END IF;

  -- Register new device
  INSERT INTO public.device_trial_fingerprints (device_hash, first_email, first_user_id)
  VALUES (p_device_hash, p_email, p_user_id);

  RETURN jsonb_build_object(
    'allowed', true,
    'reason', 'NEW_DEVICE_REGISTERED'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_or_register_trial_device TO anon, authenticated, service_role;
