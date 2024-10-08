import { User } from "grammy/types";
import { createClient } from "./create-client";

const supabase = createClient();

export interface TelegramUserDb {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  isPremium?: boolean;
  languageCode?: string;
  has_wallet: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function saveTelegramUser(
  user: User
): Promise<{ success: boolean; data?: TelegramUserDb; error?: any }> {
  try {
    const { data: existingUser, error: errorOnGettingUser } = await supabase
      .from("telegram_users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (errorOnGettingUser) {
      console.error("error on getting user", errorOnGettingUser);
      return { success: false, error: errorOnGettingUser };
    }

    if (existingUser) {
      const { data: updatedUser, error: errorOnUpdatingUser } = await supabase
        .from("telegram_users")
        .upsert(
          {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name ?? existingUser.last_name ?? null,
            username: user.username ?? existingUser.username ?? null,
            is_premium: user.is_premium ?? existingUser.is_premium ?? null,
            language_code:
              user.language_code ?? existingUser.language_code ?? null,
            has_wallet: existingUser.has_wallet,
          },
          { onConflict: "id" }
        )
        .select()
        .returns<TelegramUserDb>()
        .single();

      if (errorOnUpdatingUser) {
        console.error("error on updating user", errorOnUpdatingUser);
        return { success: false, error: errorOnUpdatingUser };
      }

      return { success: true, data: updatedUser };
    }

    const { data: newUser, error: errorOnCreatingUser } = await supabase
      .from("telegram_users")
      .insert({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name ?? null,
        username: user.username ?? null,
        is_premium: user.is_premium ?? null,
        language_code: user.language_code ?? null,
        has_wallet: false,
      })
      .select()
      .returns<TelegramUserDb>()
      .single();

    if (errorOnCreatingUser) {
      console.error("error on creating user", errorOnCreatingUser);
      return { success: false, error: errorOnCreatingUser };
    }

    return { success: true, data: newUser };
  } catch (err) {
    console.error("error on saveTelegramUser", err);
    return { success: false, error: err };
  }
}
