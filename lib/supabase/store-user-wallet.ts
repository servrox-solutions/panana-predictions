"use server";

import { createClient } from "./create-client";

const supabase = createClient({ isAdmin: true });

export async function storeUserWallet(
  walletAddress: string,
  walletName: string,
  telegramUserId?: number
) {
  try {
    const { data, error } = await supabase
      .schema("secure_schema")
      .from("user_wallets")
      .upsert(
        {
          wallet_address: walletAddress,
          wallet_name: walletName,
          telegram_user_id: telegramUserId,
        },
        { onConflict: "wallet_address" }
      )
      .select()
      .single();

    if (error) {
      console.error("Error saving wallet address:", error);
      return { success: false, error: error };
    }

    return { success: true, data: data };
  } catch (error) {
    console.error("Error saving wallet address:", error);
    return { success: false, error: error };
  }
}
