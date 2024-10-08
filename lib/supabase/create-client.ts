import { createServerClient } from "@supabase/ssr";
import { Database } from "./database.types";

export function createClient(
  { isAdmin }: { isAdmin: boolean } = { isAdmin: false }
) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    isAdmin
      ? process.env.SUPABASE_SERVICE_ROLE_KEY!
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
      },
    }
  );
}
