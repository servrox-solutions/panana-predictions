"use server";

import { Bot, CommandContext, Context, InlineKeyboard } from "grammy";
import { MessageKind } from "./types/market";
import { addEllipsis, getMessageByKind } from "./utils";
import { createClient } from "./supabase/create-client";

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
    .text(actionText, "notification-setup")
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

export async function sendNewsNotification(
  telegramUserIds: number[],
  newsId: number
) {
  /* Use all users if no telegramUserIds are provided. */
  if (telegramUserIds.length === 0) {
    const supabase = createClient({ isAdmin: true });

    const { data: userIds, error } = await supabase
      .schema("secure_schema")
      .from("telegram_users")
      .select("id");

    if (error) {
      console.error("Error reading telegram users:", error);
      throw new Error("Error reading telegram users: " + error.message);
    }

    if (userIds.length === 0) {
      console.log("No users found");
      throw new Error("No users found");
    }

    telegramUserIds = userIds.map((user) => user.id);
  }

  let messageOne = "";
  let messageTwo = "";
  let imageUrl = "";
  let menuOne = new InlineKeyboard();
  let menuTwo = new InlineKeyboard();

  switch (newsId) {
    case 1: {
      messageOne = `📢 <b>Hey there, Panana Predictions Crew!</b> 📢

It’s your favorite prediction guru, <b>Mr. Peeltos</b> 🍌, sliding into your DMs with some <strong>BIG news!</strong> 🥳

In the next few weeks, <a href="https://t.me/panana_predictions_bot">Panana Predictions</a> is making the jump to...

<tg-spoiler><u><b>APTOS MAINNET</b></u></tg-spoiler>

Yep, you heard that right. We’re going bananas and taking this baby to the next level — bringing lightning-fast predictions to the Aptos ecosystem and <strong>boosting the whole scene</strong> like never before! 🌟

Our team is <i>hustling hard behind the scenes</i>, making sure everything is smooth, sustainable, and ready for the future 🔧 But don’t worry, <b>Mr. Peeltos</b> makes serious progress exciting! 😉

<s>Let’s peel into the future together!</s>
Let’s go bananas on Aptos Mainnet! 🔥🚀`;

      imageUrl = "https://app.panana-predictions.xyz/profile_pic.jpg";
      menuOne.url(
        "Join our Community Group 🍌",
        `https://t.me/+uStUBG4k0nRkMzZi`
      );
      break;
    }
    case 2: {
      messageOne = `🔍 <b>Behind the Scenes</b> 🔍
<i>How We Ensure Accuracy and Reliability</i>

At Panana Predictions, we’re not just building a simple proof of concept—we’ve packed our very first version with advanced technology and non-trivial development to give you a solid and feature-rich platform from day one! 💪 Here's a look at the powerful services we've integrated to ensure the best prediction experience:
`;

      messageTwo = `💡 <b>Why does this matter?</b>      
By combining the power of Switchboard Oracles, NODIT, MEXC, and TradingView, we ensure that Panana Predictions provides you with accurate data, real-time updates, and historical insights—all in one platform. This level of integration strengthens our platform’s reliability, giving you the best tools to make informed and confident predictions.`;

      imageUrl = "https://app.panana-predictions.xyz/tech_stack_news.png";
      menuOne
        .text("🔮 Switchboard Oracles", "news-2-switchboard")
        .text("📊 NODIT", "news-2-nodit")
        .row()
        .text("📈 MEXC", "news-2-mexc")
        .text("🖥️ TradingView", "news-2-tradingview");

      menuTwo.url(
        "Join our Community Group 🍌",
        `https://t.me/+uStUBG4k0nRkMzZi`
      );
      break;
    }
    default: {
      throw new Error("Invalid newsId: " + newsId);
    }
  }

  telegramUserIds.forEach((telegramUserId) => {
    bot.api
      .sendPhoto(telegramUserId, imageUrl, {
        caption: messageOne,
        parse_mode: "HTML",
        reply_markup: menuOne,
      })
      .then(() => {
        if (messageTwo) {
          bot.api.sendMessage(telegramUserId, messageTwo, {
            parse_mode: "HTML",
            reply_markup: menuTwo,
            link_preview_options: { is_disabled: true },
          });
        }
      });
  });
}
