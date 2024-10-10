import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";

interface CreateClientOptions {
  isAdmin?: boolean;
}

export function createClient(
  options: CreateClientOptions = { isAdmin: false }
) {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    options.isAdmin
      ? process.env.SUPABASE_SERVICE_ROLE_KEY!
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
