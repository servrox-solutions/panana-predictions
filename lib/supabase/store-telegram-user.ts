"use server";

import { User } from "grammy/types";
import { createClient } from "./create-client";

const supabase = createClient({ isAdmin: true });

export interface TelegramUserDb {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  isPremium: boolean;
  languageCode?: string;
  isBot: boolean;
  has_wallet: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function storeTelegramUser(
  user: User
): Promise<{ success: boolean; data?: TelegramUserDb; error?: any }> {
  try {
    const { data: upsertedUser, error: errorOnUpsert } = await supabase
      .schema("secure_schema")
      .from("telegram_users")
      .upsert(
        {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name ?? null,
          username: user.username ?? null,
          is_premium: user.is_premium ?? false,
          is_bot: user.is_bot ?? false,
          language_code: user.language_code ?? null,
          has_wallet: false,
        },
        { onConflict: "id" }
      )
      .select()
      .returns<TelegramUserDb>()
      .single();

    if (errorOnUpsert) {
      console.error(
        "error on upserting user",
        "\n error:",
        errorOnUpsert,
        "\n given user: ",
        user,
        "\n upserted user: ",
        upsertedUser
      );
      return { success: false, error: errorOnUpsert };
    }

    return { success: true, data: upsertedUser };
  } catch (err) {
    console.error("error on storeTelegramUser", err);
    return { success: false, error: err };
  }
}
