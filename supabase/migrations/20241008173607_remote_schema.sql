-- Create schema if it doesn't exist
create schema if not exists "secure_schema" authorization "postgres";

-- Extensions
create extension if not exists "pgsodium" with schema "pgsodium";
create extension if not exists "moddatetime" with schema "extensions";
create extension if not exists "pg_graphql" with schema "graphql";
create extension if not exists "pg_stat_statements" with schema "extensions";
create extension if not exists "pgcrypto" with schema "extensions";
create extension if not exists "pgjwt" with schema "extensions";
create extension if not exists "supabase_vault" with schema "vault";

-- Function to update 'updated_at' field on modification
create or replace function "public"."moddatetime" () returns "trigger"
    language "plpgsql" as $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

alter function "public"."moddatetime" () owner to "postgres";

-- Telegram Users table
create table if not exists "secure_schema"."telegram_users" (
    "id" bigint not null,
    "first_name" "text" not null,
    "last_name" "text",
    "username" "text",
    "is_premium" boolean not null,
    "language_code" character varying(10),
    "created_at" timestamp with time zone default "now" (),
    "updated_at" timestamp with time zone default "now" (),
    "has_wallet" boolean not null,
    "is_bot" boolean not null,
    primary key ("id")
);

alter table "secure_schema"."telegram_users" owner to "postgres";

-- Trigger for automatically updating the 'updated_at' field
create or replace trigger "handle_updated_at_telegram"
before update on "secure_schema"."telegram_users"
for each row execute function "public"."moddatetime" ();

-- Enable Row Level Security (RLS)
alter table "secure_schema"."telegram_users" enable row level security;
create policy "service_role_access_telegram_users" on "secure_schema"."telegram_users"
for all to "service_role" using (true);

revoke all on "secure_schema"."telegram_users" from PUBLIC;

-- User Wallets table
create table if not exists "secure_schema"."user_wallets" (
    "wallet_address" varchar(255) not null,
    "wallet_name" varchar(255) not null,
    "telegram_user_id" bigint,
    "created_at" timestamp with time zone default "now" (),
    "updated_at" timestamp with time zone default "now" (),
    primary key ("wallet_address"),
    constraint "fk_telegram_user_id" foreign key ("telegram_user_id")
    references "secure_schema"."telegram_users" ("id") on delete set null
);

alter table "secure_schema"."user_wallets" owner to "postgres";

-- Trigger for automatically updating the 'updated_at' field
create or replace trigger "handle_updated_at_wallets"
before update on "secure_schema"."user_wallets"
for each row execute function "public"."moddatetime" ();

alter table "secure_schema"."user_wallets" enable row level security;
create policy "service_role_access_user_wallets" on "secure_schema"."user_wallets"
for all to "service_role" using (true);

revoke all on "secure_schema"."user_wallets" from PUBLIC;

-- Telegram Notifications table
create table if not exists "secure_schema"."telegram_notifications" (
    "id" bigserial primary key, -- Use bigserial or identity column
    "created_at" timestamp with time zone default "now" (),
    "market_address" varchar(255) not null,
    "telegram_user_id" bigint,
    "time_to_send" timestamp with time zone not null,
    "message_kind" varchar(255) not null,
    constraint "fk_telegram_user_id" foreign key ("telegram_user_id")
    references "secure_schema"."telegram_users" ("id") on delete set null
);

alter table "secure_schema"."telegram_notifications" owner to "postgres";

-- Enable Row Level Security (RLS)
alter table "secure_schema"."telegram_notifications" enable row level security;
create policy "service_role_access_telegram_notifications" on "secure_schema"."telegram_notifications"
for all to "service_role" using (true);

revoke all on "secure_schema"."telegram_notifications" from PUBLIC;


-- Create a trigger function that updates has_wallet in telegram_users
CREATE OR REPLACE FUNCTION update_has_wallet_on_user_wallet_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if telegram_user_id is not null
  IF NEW.telegram_user_id IS NOT NULL THEN
    -- Update the corresponding telegram_users row to set has_wallet to true
    UPDATE "secure_schema"."telegram_users"
    SET has_wallet = TRUE
    WHERE id = NEW.telegram_user_id;
  END IF;
  
  -- Return the new row for insertion
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger on user_wallets that calls the function after insert
CREATE TRIGGER trigger_update_has_wallet
AFTER INSERT ON "secure_schema"."user_wallets"
FOR EACH ROW
EXECUTE FUNCTION update_has_wallet_on_user_wallet_insert();


-- Step 1: Add a 'deleted_at' column to support soft deletes
ALTER TABLE "secure_schema"."telegram_notifications"
ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;

-- Step 2: Update the trigger function to automatically set 'deleted_at' instead of deleting
CREATE OR REPLACE FUNCTION soft_delete_telegram_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark the row as deleted by setting the 'deleted_at' timestamp
  NEW.deleted_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Update the trigger to apply soft deletes instead of hard deletes
CREATE TRIGGER soft_delete_trigger
BEFORE DELETE ON "secure_schema"."telegram_notifications"
FOR EACH ROW
EXECUTE FUNCTION soft_delete_telegram_notification();

-- Optional: Update RLS (Row-Level Security) to hide soft-deleted rows from normal queries
-- Assuming RLS is enabled for the table
CREATE POLICY "exclude_soft_deleted" ON "secure_schema"."telegram_notifications"
FOR SELECT TO PUBLIC
USING (deleted_at IS NULL);

-- Grant usage and update permissions on the sequence to the relevant role (e.g., service_role or authenticated)
GRANT USAGE, SELECT ON SEQUENCE "secure_schema"."telegram_notifications_id_seq" TO "service_role";
GRANT USAGE, SELECT ON SEQUENCE "secure_schema"."telegram_notifications_id_seq" TO "authenticated";


-- Step 1: Create the trigger function that updates has_wallet in telegram_users
CREATE OR REPLACE FUNCTION "secure_schema".update_has_wallet_on_user_wallet_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if telegram_user_id is not null
  IF NEW.telegram_user_id IS NOT NULL THEN
    -- Update the corresponding telegram_users row to set has_wallet to true
    UPDATE "secure_schema"."telegram_users"
    SET has_wallet = TRUE
    WHERE id = NEW.telegram_user_id;
  END IF;

  -- Return the new row for insertion
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create a trigger on user_wallets that calls the function after insert
CREATE OR REPLACE TRIGGER trigger_update_has_wallet
AFTER INSERT ON "secure_schema"."user_wallets"
FOR EACH ROW
EXECUTE FUNCTION "secure_schema".update_has_wallet_on_user_wallet_insert();


-- Create or replace the trigger function that updates has_wallet in telegram_users
CREATE OR REPLACE FUNCTION "secure_schema".update_has_wallet_on_user_wallet_insert_or_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if telegram_user_id is not null
  IF NEW.telegram_user_id IS NOT NULL THEN
    -- Update the corresponding telegram_users row to set has_wallet to true
    UPDATE "secure_schema"."telegram_users"
    SET has_wallet = TRUE
    WHERE id = NEW.telegram_user_id;
  END IF;

  -- Return the new or updated row
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger on user_wallets that fires on INSERT or UPDATE
CREATE OR REPLACE TRIGGER trigger_update_has_wallet
AFTER INSERT OR UPDATE ON "secure_schema"."user_wallets"
FOR EACH ROW
EXECUTE FUNCTION "secure_schema".update_has_wallet_on_user_wallet_insert_or_update();

-- Enable the pg_cron extension (in case it's not installed)
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE EXTENSION IF NOT EXISTS "http";

CREATE OR REPLACE FUNCTION call_edge_function(market_address TEXT, telegram_user_id INT, message_kind TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
    response json;
BEGIN
    -- Make the HTTP request to your Supabase Edge Function
    SELECT content INTO response
    FROM http_post(
        'https://app.panana-predictions.xyz/api/telegram/notify',
        'application/json',
        json_build_object(
            'market_address', market_address,
            'telegram_user_id', telegram_user_id,
            'message_kind', message_kind
        )::TEXT
    );
    
    -- Log the response for debugging
    RAISE NOTICE 'Edge Function Response: %', response;
END;
$$;

CREATE OR REPLACE FUNCTION schedule_notification_in_pg_cron()
RETURNS TRIGGER AS $$
DECLARE
    cron_job_id INT;
BEGIN
    -- Schedule the task using pg_cron to run at the 'time_to_send'
    PERFORM cron.schedule(
        jobname := 'notify_' || NEW.id,
        schedule := to_char(NEW.time_to_send, 'YYYY-MM-DD HH24:MI:SS'),
        command := 'SELECT call_edge_function(''' || NEW.market_address || ''', ' || NEW.telegram_user_id || ', ''' || NEW.message_kind || ''')'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_schedule_notification
AFTER INSERT ON "secure_schema"."telegram_notifications"
FOR EACH ROW
EXECUTE FUNCTION schedule_notification_in_pg_cron();
