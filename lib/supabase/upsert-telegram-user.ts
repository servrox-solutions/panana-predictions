import { createClient } from "./create-client";

const supabase = createClient();

export interface TelegramUserDb {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  isPremium?: boolean;
  languageCode?: string;
  walletAddresses: string[];
  createdAt?: string;
  updatedAt?: string;
}

export async function upsertTelegramUser(user: TelegramUserDb) {
  try {
    const { data, error } = await supabase.from("telegram_users").upsert(
      {
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName || null,
        username: user.username || null,
        is_premium: user.isPremium || null,
        language_code: user.languageCode || null,
        wallet_addresses: user.walletAddresses,
        created_at: user.createdAt || undefined,
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("Fehler beim Upsert:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Serverfehler:", err);
    return { success: false, error: err };
  }
}
