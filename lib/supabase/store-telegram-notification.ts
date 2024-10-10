"use server";

import { Bot } from "grammy";
import { MessageKind } from "../types/market";
import { createClient } from "./create-client";
import { getMessageByKind } from "../utils";

const supabase = createClient({ isAdmin: true });

export async function storeTelegramNotification(
  marketAddress: string,
  telegramUserId: number,
  timeToSend: string,
  messageKind: MessageKind
) {
  try {
    const { data: existingNotification, error: errorOnCheck } = await supabase
      .schema("secure_schema")
      .from("telegram_notifications")
      .select("*")
      .eq("market_address", marketAddress)
      .eq("message_kind", messageKind)
      .is("deleted_at", null)
      .single();

    if (errorOnCheck && errorOnCheck.code !== "PGRST116") {
      console.error("Error checking existing notification:", errorOnCheck);
      return { success: false, error: errorOnCheck };
    }

    if (existingNotification) {
      const { error: errorOnSoftDelete } = await supabase
        .schema("secure_schema")
        .from("telegram_notifications")
        .update({ deleted_at: new Date().toISOString() })
        .eq("market_address", marketAddress)
        .eq("message_kind", messageKind);

      if (errorOnSoftDelete) {
        console.error("Error performing soft delete:", errorOnSoftDelete);
        return { success: false, error: errorOnSoftDelete };
      }

      //TODO: this is just a quick test
      const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
      await bot.api.sendMessage(
        telegramUserId,
        `🔕 Disabled _${getMessageByKind(
          messageKind
        )} notification_ for [market](https://app.panana-predictions.xyz/markets/${marketAddress})`,
        {
          parse_mode: "MarkdownV2",
          link_preview_options: { is_disabled: true },
        }
      );

      return { success: true, message: "Existing notification soft deleted" };
    }

    const { data, error } = await supabase
      .schema("secure_schema")
      .from("telegram_notifications")
      .upsert({
        market_address: marketAddress,
        telegram_user_id: telegramUserId,
        time_to_send: timeToSend,
        message_kind: messageKind,
        deleted_at: null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving telegram notification:", error);
      return { success: false, error: error };
    }

    //TODO: this is just a quick test
    const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
    await bot.api.sendMessage(
      telegramUserId,
      `🔔 Enabled _${getMessageByKind(
        messageKind
      )} notification_ for [market](https://app.panana-predictions.xyz/markets/${marketAddress})`,
      {
        parse_mode: "MarkdownV2",
        link_preview_options: { is_disabled: true },
      }
    );

    return { success: true, data: data };
  } catch (error) {
    console.error("Error saving telegram notification:", error);
    return { success: false, error: error };
  }
}
