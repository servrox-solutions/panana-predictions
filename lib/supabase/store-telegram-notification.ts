"use server";

import { MessageKind } from "../types/market";
import { createClient } from "./create-client";
import { sendNotificationSetupMessage } from "../send-telegram-message";

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
      .single();

    if (errorOnCheck && errorOnCheck.code !== "PGRST116") {
      console.error("Error checking existing notification:", errorOnCheck);
      return { success: false, error: errorOnCheck };
    }

    if (existingNotification) {
      if (existingNotification.deleted_at === null) {
        const { error: errorOnSoftDelete } = await supabase
          .schema("secure_schema")
          .from("telegram_notifications")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", existingNotification.id);

        if (errorOnSoftDelete) {
          console.error("Error performing soft delete:", errorOnSoftDelete);
          return { success: false, error: errorOnSoftDelete };
        }

        await sendNotificationSetupMessage(
          telegramUserId,
          messageKind,
          marketAddress,
          timeToSend,
          false
        );

        return { success: true, message: "Notification soft deleted" };
      } else {
        const { error: errorOnReactivate } = await supabase
          .schema("secure_schema")
          .from("telegram_notifications")
          .update({ deleted_at: null })
          .eq("id", existingNotification.id);

        if (errorOnReactivate) {
          console.error("Error reactivating notification:", errorOnReactivate);
          return { success: false, error: errorOnReactivate };
        }

        await sendNotificationSetupMessage(
          telegramUserId,
          messageKind,
          marketAddress,
          timeToSend,
          true
        );

        return { success: true, message: "Notification reactivated" };
      }
    } else {
      const { data, error: errorOnInsert } = await supabase
        .schema("secure_schema")
        .from("telegram_notifications")
        .insert({
          market_address: marketAddress,
          telegram_user_id: telegramUserId,
          time_to_send: timeToSend,
          message_kind: messageKind,
          deleted_at: null,
        })
        .select()
        .single();

      if (errorOnInsert) {
        console.error("Error inserting new notification:", errorOnInsert);
        return { success: false, error: errorOnInsert };
      }

      await sendNotificationSetupMessage(
        telegramUserId,
        messageKind,
        marketAddress,
        timeToSend,
        true
      );

      return { success: true, data: data };
    }
  } catch (error) {
    console.error("Error saving telegram notification:", error);
    return { success: false, error: error };
  }
}
