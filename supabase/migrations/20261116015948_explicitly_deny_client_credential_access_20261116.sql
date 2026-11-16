-- Restored from the linked production project's applied migration history.
-- Version: 20261116015948
-- Name: explicitly_deny_client_credential_access_20261116

CREATE POLICY "No direct client access to provider credentials"
      ON public.provider_credentials
      FOR ALL
      TO anon, authenticated
      USING (false)
      WITH CHECK (false);
