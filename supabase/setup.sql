-- Create required extensions
-- CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";
-- CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";
-- CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "public";
-- CREATE EXTENSION IF NOT EXISTS "moddatetime" WITH SCHEMA "extensions";
-- CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
-- CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
-- CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";
-- CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- Create secure schema
CREATE SCHEMA IF NOT EXISTS "secure_schema";
ALTER SCHEMA "secure_schema" OWNER TO "postgres";

-- Function: moddatetime
CREATE OR REPLACE FUNCTION "public"."moddatetime"() RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."moddatetime"() OWNER TO "postgres";


-- Function: soft_delete_telegram_notification
CREATE OR REPLACE FUNCTION "public"."soft_delete_telegram_notification"() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    -- Mark as deleted
    NEW.deleted_at = NOW();
    -- Unschedule cron job
    PERFORM cron.unschedule('notify_' || OLD.id);
    RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."soft_delete_telegram_notification"() OWNER TO "postgres";

-- Function: update_has_wallet_on_user_insert
CREATE OR REPLACE FUNCTION "secure_schema"."update_has_wallet_on_user_insert"() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    -- Check for existing wallets
    IF EXISTS (
        SELECT 1
        FROM "secure_schema"."user_wallets"
        WHERE telegram_user_id = NEW.id
    ) THEN
        -- Update has_wallet
        UPDATE "secure_schema"."telegram_users"
        SET has_wallet = TRUE
        WHERE id = NEW.id;
    END IF;

    RETURN NULL; -- AFTER trigger
END;
$$;

ALTER FUNCTION "secure_schema"."update_has_wallet_on_user_insert"() OWNER TO "postgres";

-- Function: update_has_wallet_on_user_wallet_insert_or_update
CREATE OR REPLACE FUNCTION "secure_schema"."update_has_wallet_on_user_wallet_insert_or_update"() RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.telegram_user_id IS NOT NULL THEN
        -- Update only if has_wallet is false
        UPDATE "secure_schema"."telegram_users"
        SET has_wallet = TRUE
        WHERE id = NEW.telegram_user_id AND has_wallet = FALSE;
    END IF;

    RETURN NEW;
END;
$$;

ALTER FUNCTION "secure_schema"."update_has_wallet_on_user_wallet_insert_or_update"() OWNER TO "postgres";

-- Function: handle_recreate_notification
CREATE OR REPLACE FUNCTION "secure_schema"."handle_recreate_notification"() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    existing_id bigint;
BEGIN
    -- Check for existing soft-deleted notification
    SELECT id INTO existing_id
    FROM "secure_schema"."telegram_notifications"
    WHERE "market_address" = NEW."market_address"
      AND "telegram_user_id" = NEW."telegram_user_id"
      AND "message_kind" = NEW."message_kind"
      AND "deleted_at" IS NOT NULL
    LIMIT 1;

    IF existing_id IS NOT NULL THEN
        -- Update the existing notification
        UPDATE "secure_schema"."telegram_notifications"
        SET
            "deleted_at" = NULL,
            "time_to_send" = NEW."time_to_send",
            "created_at" = NOW()
        WHERE id = existing_id;

        -- Prevent insertion
        RETURN NULL;
    ELSE
        -- Proceed with insertion
        RETURN NEW;
    END IF;
END;
$$;

ALTER FUNCTION "secure_schema"."handle_recreate_notification"() OWNER TO "postgres";

-- Tables and Indexes

-- Sequence for telegram_notifications
CREATE SEQUENCE IF NOT EXISTS "secure_schema"."telegram_notifications_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "secure_schema"."telegram_notifications_id_seq" OWNER TO "postgres";

-- Table: telegram_users
CREATE TABLE IF NOT EXISTS "secure_schema"."telegram_users" (
    "id" bigint NOT NULL,
    "first_name" text NOT NULL,
    "last_name" text,
    "username" text,
    "is_premium" boolean NOT NULL,
    "language_code" character varying(10),
    "created_at" timestamp with time zone DEFAULT NOW(),
    "updated_at" timestamp with time zone DEFAULT NOW(),
    "has_wallet" boolean NOT NULL DEFAULT FALSE,
    "is_bot" boolean NOT NULL,
    PRIMARY KEY ("id")
);

ALTER TABLE "secure_schema"."telegram_users" OWNER TO "postgres";

-- Indexes on telegram_users
CREATE INDEX IF NOT EXISTS "idx_telegram_users_username"
ON "secure_schema"."telegram_users" ("username");

CREATE INDEX IF NOT EXISTS "idx_telegram_users_has_wallet"
ON "secure_schema"."telegram_users" ("has_wallet");

-- Table: user_wallets
CREATE TABLE IF NOT EXISTS "secure_schema"."user_wallets" (
    "wallet_address" character varying(255) NOT NULL,
    "wallet_name" character varying(255) NOT NULL,
    "telegram_user_id" bigint,
    "created_at" timestamp with time zone DEFAULT NOW(),
    "updated_at" timestamp with time zone DEFAULT NOW(),
    PRIMARY KEY ("wallet_address"),
    FOREIGN KEY ("telegram_user_id") REFERENCES "secure_schema"."telegram_users"("id") ON DELETE SET NULL
);

ALTER TABLE "secure_schema"."user_wallets" OWNER TO "postgres";

-- Indexes on user_wallets
CREATE INDEX IF NOT EXISTS "idx_user_wallets_telegram_user_id"
ON "secure_schema"."user_wallets" ("telegram_user_id");

-- Table: telegram_notifications
CREATE TABLE IF NOT EXISTS "secure_schema"."telegram_notifications" (
    "id" bigint NOT NULL DEFAULT nextval('secure_schema.telegram_notifications_id_seq'::regclass),
    "created_at" timestamp with time zone DEFAULT NOW(),
    "market_address" character varying(255) NOT NULL,
    "telegram_user_id" bigint,
    "time_to_send" timestamp with time zone NOT NULL,
    "message_kind" character varying(255) NOT NULL,
    "deleted_at" timestamp with time zone,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("telegram_user_id") REFERENCES "secure_schema"."telegram_users"("id") ON DELETE SET NULL
);

ALTER TABLE "secure_schema"."telegram_notifications" OWNER TO "postgres";

-- Indexes on telegram_notifications
CREATE UNIQUE INDEX IF NOT EXISTS "idx_unique_active_notification"
ON "secure_schema"."telegram_notifications" (
    "market_address",
    "telegram_user_id",
    "message_kind"
)
WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_telegram_notifications_deleted_at"
ON "secure_schema"."telegram_notifications" ("deleted_at");

CREATE INDEX IF NOT EXISTS "idx_telegram_notifications_time_to_send"
ON "secure_schema"."telegram_notifications" ("time_to_send");


ALTER SEQUENCE "secure_schema"."telegram_notifications_id_seq" OWNED BY "secure_schema"."telegram_notifications"."id";

-- Triggers

-- Trigger: handle_updated_at_telegram
CREATE OR REPLACE TRIGGER "handle_updated_at_telegram"
BEFORE UPDATE ON "secure_schema"."telegram_users"
FOR EACH ROW EXECUTE FUNCTION "public"."moddatetime"();

-- Trigger: handle_updated_at_wallets
CREATE OR REPLACE TRIGGER "handle_updated_at_wallets"
BEFORE UPDATE ON "secure_schema"."user_wallets"
FOR EACH ROW EXECUTE FUNCTION "public"."moddatetime"();

-- Trigger: soft_delete_trigger
CREATE OR REPLACE TRIGGER "soft_delete_trigger"
BEFORE DELETE ON "secure_schema"."telegram_notifications"
FOR EACH ROW EXECUTE FUNCTION "public"."soft_delete_telegram_notification"();

-- Trigger: trigger_update_has_wallet_on_user_insert
CREATE OR REPLACE TRIGGER "trigger_update_has_wallet_on_user_insert"
AFTER INSERT ON "secure_schema"."telegram_users"
FOR EACH ROW EXECUTE FUNCTION "secure_schema"."update_has_wallet_on_user_insert"();

-- Trigger: trigger_update_has_wallet
CREATE OR REPLACE TRIGGER "trigger_update_has_wallet"
AFTER INSERT OR UPDATE ON "secure_schema"."user_wallets"
FOR EACH ROW EXECUTE FUNCTION "secure_schema"."update_has_wallet_on_user_wallet_insert_or_update"();

-- Trigger: trigger_handle_recreate_notification
CREATE OR REPLACE TRIGGER "trigger_handle_recreate_notification"
BEFORE INSERT ON "secure_schema"."telegram_notifications"
FOR EACH ROW EXECUTE FUNCTION "secure_schema"."handle_recreate_notification"();

-- Policies and Permissions

-- Enable row-level security
ALTER TABLE "secure_schema"."telegram_notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "secure_schema"."telegram_users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "secure_schema"."user_wallets" ENABLE ROW LEVEL SECURITY;

-- Policies for telegram_notifications
CREATE POLICY "exclude_soft_deleted" ON "secure_schema"."telegram_notifications"
FOR SELECT USING ("deleted_at" IS NULL);

CREATE POLICY "service_role_access_telegram_notifications" ON "secure_schema"."telegram_notifications"
TO "service_role" USING (TRUE);

-- Policies for telegram_users
CREATE POLICY "service_role_access_telegram_users" ON "secure_schema"."telegram_users"
TO "service_role" USING (TRUE);

-- Policies for user_wallets
CREATE POLICY "service_role_access_user_wallets" ON "secure_schema"."user_wallets"
TO "service_role" USING (TRUE);

-- Grant usage on schemas
GRANT USAGE ON SCHEMA "public" TO "postgres", "anon", "authenticated", "service_role";
GRANT USAGE ON SCHEMA "secure_schema" TO "authenticated", "service_role";

-- Grant permissions on functions
GRANT EXECUTE ON FUNCTION "public"."moddatetime"() TO "anon", "authenticated", "service_role";
GRANT EXECUTE ON FUNCTION "public"."soft_delete_telegram_notification"() TO "anon", "authenticated", "service_role";
GRANT EXECUTE ON FUNCTION "secure_schema"."update_has_wallet_on_user_insert"() TO "authenticated", "service_role";
GRANT EXECUTE ON FUNCTION "secure_schema"."update_has_wallet_on_user_wallet_insert_or_update"() TO "authenticated", "service_role";
GRANT EXECUTE ON FUNCTION "secure_schema"."handle_recreate_notification"() TO "authenticated", "service_role";

-- Grant permissions on tables and sequences
GRANT SELECT, INSERT, UPDATE, DELETE ON "secure_schema"."telegram_notifications" TO "authenticated", "service_role";
GRANT SELECT, INSERT, UPDATE, DELETE ON "secure_schema"."telegram_users" TO "authenticated", "service_role";
GRANT SELECT, INSERT, UPDATE, DELETE ON "secure_schema"."user_wallets" TO "authenticated", "service_role";

GRANT USAGE, SELECT ON SEQUENCE "secure_schema"."telegram_notifications_id_seq" TO "authenticated", "service_role";

-- Default privileges for future objects in public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA "public"
GRANT EXECUTE ON FUNCTIONS TO "postgres", "anon", "authenticated", "service_role";
ALTER DEFAULT PRIVILEGES IN SCHEMA "public"
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "postgres", "anon", "authenticated", "service_role";
ALTER DEFAULT PRIVILEGES IN SCHEMA "public"
GRANT USAGE, SELECT ON SEQUENCES TO "postgres", "anon", "authenticated", "service_role";

-- Additional Functions

-- Synchronize has_wallet for existing users
UPDATE "secure_schema"."telegram_users" tu
SET has_wallet = TRUE
WHERE (has_wallet = FALSE OR has_wallet IS NULL)
  AND EXISTS (
    SELECT 1
    FROM "secure_schema"."user_wallets" uw
    WHERE uw.telegram_user_id = tu.id
);

-- Reset all settings
RESET ALL;
