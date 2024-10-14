"use server";

import { Bot, CommandContext, Context, InlineKeyboard } from "grammy";
import { MessageKind } from "./types/market";
import { addEllipsis, getMessageByKind } from "./utils";
import { callbackIdentifierNotificationSetup } from "@/app/api/telegram/webhook/route";

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token)
  throw new Error("TELEGRAM_BOT_TOKEN environment variable not found.");

const bot = new Bot(token);

export async function sendDebugMessage(ctx: CommandContext<Context>) {
  const info = ctx.update.message?.from ?? ctx.update.message?.chat;
  if (!info) return;

  const msg =
    "/start by " +
    `@${info.username ?? "unknown"}` +
    "\n" +
    `first name: ${info.first_name ?? "unknown"}` +
    "\n" +
    `last name: ${info.last_name ?? "unknown"}` +
    "\n" +
    `language: ${ctx.update.message?.from.language_code ?? "unknown"}`;

  bot.api.sendMessage(134685150, msg);
}

export async function sendNotificationSetupMessage(
  telegramUserId: number,
  messageKind: MessageKind,
  marketAddress: string,
  timeToSend: string,
  isEnabled: boolean
) {
  const message = `${isEnabled ? "🔔" : "🔕"} *${getMessageByKind(
    messageKind
  )}* Notification ${isEnabled ? "enabled" : "disabled"}\\.`;

  const actionText = isEnabled ? "🔕 Disable" : "🔔 Re-Enable";

  const urlText = `For Market (${addEllipsis(marketAddress, 6, 4)})`;

  const inlineKeyboard = new InlineKeyboard()
    .text(actionText, callbackIdentifierNotificationSetup)
    .url(
      urlText,
      `https://app.panana-predictions.xyz/markets/${marketAddress}?messageKind=${messageKind}&timeToSend=${timeToSend}`
    );

  return bot.api.sendMessage(telegramUserId, message, {
    reply_markup: inlineKeyboard,
    parse_mode: "MarkdownV2",
    link_preview_options: { is_disabled: true },
  });
}

export async function sendNotification(
  telegramUserId: number,
  messageKind: MessageKind,
  marketAddress: string
) {
  const message = `🚨 *${getMessageByKind(messageKind)}* Notification`;

  const urlText = `Go to Market (${addEllipsis(marketAddress, 6, 4)})`;

  const inlineKeyboard = new InlineKeyboard()
    .webApp("Open App 🍌", "https://app.panana-predictions.xyz/")
    .url(
      urlText,
      `https://app.panana-predictions.xyz/markets/${marketAddress}`
    );

  return bot.api.sendMessage(telegramUserId, message, {
    reply_markup: inlineKeyboard,
    parse_mode: "MarkdownV2",
    link_preview_options: { is_disabled: true },
  });
}
