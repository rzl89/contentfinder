# Supabase database migrations

## Source of truth

The initial schema baseline in this directory was reconstructed from the linked production project's PostgreSQL catalogs on **2026-11-16**. It contains the 12 existing application tables, their columns/defaults/nullability, primary/foreign/unique/check constraints, and seven non-constraint indexes observed in production.

The baseline is not an inferred schema. It was generated from `information_schema.columns`, `pg_constraint`, and `pg_indexes` and compared with the live application schema.

## Migration history

The five security migration files with version prefixes starting `20261116...` were restored byte-for-byte from `supabase_migrations.schema_migrations` on the production database.

The earlier baseline version is `20261115000000`. On the current production project, those tables and indexes already exist. The production deployment workflow therefore records this baseline as applied using `supabase migration repair` before running `supabase db push`; it does not re-create or reset production data.

On a clean local database, `supabase db reset` applies the baseline first and then the five later migrations in timestamp order.

Two later migration files (`20261116015922_verify_auto_rls_trigger_probe_20261116.sql` and `20261116015929_remove_auto_rls_trigger_probe_20261116.sql`) are a paired temporary test. They create and immediately remove an isolated table to verify automatic RLS activation where the event trigger is present. No probe table remains in production.

## Production deployment

The workflow `.github/workflows/supabase-migrations.yml` validates the complete migration chain on pull requests by starting a clean local Supabase stack and running `supabase db reset`.

On pushes to `main`, the same workflow deploys pending migrations to the linked production project. It first repairs the baseline version as applied because production was provisioned before this baseline file existed. It then runs `supabase db push`.

The production job is intentionally skipped until these GitHub Actions repository secrets exist:

- `SUPABASE_ACCESS_TOKEN`: Supabase personal access token for the deployment actor.
- `SUPABASE_DB_PASSWORD`: database password for the existing production project.

The workflow is pinned to the current production project reference `uoxoljiucezwdpqfnuga`. Do not reuse this deployment workflow unchanged for a different/new Supabase project: a new project should run the baseline normally, not mark it as already applied.

## Remaining platform note

The production project has an existing event trigger named `ensure_rls` and its function `public.rls_auto_enable()`. The function definition is represented in the baseline and its public execution is revoked by the security migration. Event-trigger creation is not included in the baseline because hosted Supabase restricts event-trigger DDL to elevated platform privileges; all 12 application tables instead have explicit RLS enablement in the baseline.

The default-privilege hardening migration applies to objects created by `postgres`. Changing defaults owned by `supabase_admin` was not possible with the connected database role and remains an administrative follow-up.

## Workflow

```bash
supabase start
supabase db reset
supabase stop
```

For future schema changes, add a new timestamped migration under `supabase/migrations`, test the full chain locally, then open a pull request. Do not modify production schema directly through the dashboard once this migration workflow is in use.
