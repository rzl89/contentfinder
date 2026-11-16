# Supabase database migrations

This directory restores the SQL migration files recorded in the linked production project's `supabase_migrations.schema_migrations` history on 2026-11-16.

## Important deployment notes

- The five migration filenames and version prefixes match the five migration records already applied to production.
- The production project already records these versions as applied. Keep the filenames and version prefixes unchanged to avoid treating them as new migrations.
- Two files (`20261116015922_verify_auto_rls_trigger_probe_20261116.sql` and `20261116015929_remove_auto_rls_trigger_probe_20261116.sql`) are a temporary RLS-trigger verification pair. Together they create and immediately remove a uniquely named probe table; no probe table remains in production.
- This repository does **not yet contain a canonical, verified bootstrap migration for the pre-existing application schema**. The legacy SQL in `server/db/schema.sql` and `server/db/rls_policies.sql` does not exactly match production (including the profile plan-tier CHECK constraint and current security policies).
- Until a separate baseline/schema-reconciliation change has been reviewed and tested against a fresh Supabase database/preview branch, do not use this migration directory to provision a brand-new project or preview database. These files document and reconcile the already-applied production changes; they are not yet a complete clean-install history.

## Next required work

1. Compare the complete live schema against the legacy SQL and produce a canonical baseline migration.
2. Validate the baseline plus these security migrations against a disposable clean database/preview branch.
3. Only after those checks, enable automatic migration deployment for the production-linked branch.
