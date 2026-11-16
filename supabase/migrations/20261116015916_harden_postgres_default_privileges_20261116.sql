-- Restored from the linked production project's applied migration history.
-- Version: 20261116015916
-- Name: harden_postgres_default_privileges_20261116

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
      REVOKE ALL PRIVILEGES ON TABLES FROM PUBLIC, anon, authenticated;
    ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
      REVOKE ALL PRIVILEGES ON SEQUENCES FROM PUBLIC, anon, authenticated;
    ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
      REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;
