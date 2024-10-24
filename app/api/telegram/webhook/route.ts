export const dynamic = "force-dynamic";

export const fetchCache = "force-no-store";

import { Bot, InlineKeyboard, webhookCallback } from "grammy";
import { Menu } from "@grammyjs/menu";
import { storeTelegramUser } from "@/lib/supabase/store-telegram-user";
import { sendDebugMessage } from "@/lib/send-telegram-message";
import { Address, MessageKind } from "@/lib/types/market";
import { storeTelegramNotification } from "@/lib/supabase/store-telegram-notification";

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token)
  throw new Error("TELEGRAM_BOT_TOKEN environment variable not found.");

const bot = new Bot(token);

bot.use(async (ctx, next) => {
  if (ctx.from) {
    storeTelegramUser(ctx.from).then((result) => {
      if (result.success) {
        console.log("user saved", result.data);
      } else {
        console.error("error on saving user", result.error);
      }
    });
  }

  await next();
});

const descriptionMessage = `
Welcome to Panana Predictions 🍌

Panana Predictions is the pioneering decentralized prediction market on the Aptos Network.

The entire market is easy to use right here in Telegram, making it more convenient than ever!

Let's start!
`;

const welcomeMessage = `
Panana Predictions is the leading decentralized prediction market on the *Aptos Network*.

_Think you’ve got what it takes?_  
*Open the app and start predicting!* 🔮

Here’s how you can get more involved:
- Tap *FAQ* to learn how it works.
- Visit our *Website* for more details.
- Follow us on *X* to stay updated.
`;

const faqMessage = `
*What is Panana Predictions?* 🤔
Panana Predictions is a decentralized crypto asset price prediction market where users can bet on whether a supported crypto asset's price will go up 📈 or down 📉 within a specified time frame. If your prediction is correct, you win a proportional share of the opposing bets. 🎉

*How do the prediction markets work?* 🛠️
When a market opens, users can place bets on whether the price of a chosen asset (e.g., SOL, ETH, APT, USDC, or BTC) will go up 📈 or down 📉 by the end of the specified time period. Once the market starts, no new bets can be placed, and the market will automatically resolve after the predefined time has passed. ⏰ The winning side receives the funds from the losing side, distributed proportionally based on the amount bet. 💸

*Can I withdraw my assets after placing a bet?* 🚫
No, once you place a bet, you cannot withdraw your assets until the market resolves. Your funds remain locked 🔒 in the market until the outcome is determined, and winners are paid out. 🏆

*What are the fees involved in Panana Predictions?* 💰
A 2% fee is applied to all winning bets. This fee is automatically deducted from the winnings when the market resolves. 💸

*Can I bet on both sides of a prediction market?* ⚖️
Yes, you can place bets on both outcomes (price going up 📈 or down 📉) in the same market if you choose. However, you cannot withdraw or alter these bets once placed. 🚫

*How are markets resolved, and can users resolve them?* 🤖
Markets are automatically resolved by our platform once the predetermined time has passed. ⏲️ In rare cases, users also have the option to manually resolve the market once the market period has ended, although this should not typically be necessary. ✅

*Can anyone create a market, and what assets are supported?* 🌐
Yes, anyone can create a market on Panana Predictions. The supported assets for creating markets and placing bets are SOL, ETH, APT, USDC, and BTC. Once a market is created, other users can participate and bet on the outcome. 🪙

_If you have further questions, feel free to ask!_ 💬
`;

bot.api.setMyCommands([
  { command: "start", description: "Show welcome message" },
  { command: "help", description: "Show FAQ" },
]);

bot.api.setChatMenuButton({
  menu_button: {
    type: "web_app",
    text: "Open App 🍌",
    web_app: { url: "https://app.panana-predictions.xyz/" },
  },
});

bot.api.setMyDescription(descriptionMessage);

const welcomeMenu = new Menu("welcome-menu")
  .webApp("Open App 🍌", "https://app.panana-predictions.xyz/")
  .row()
  .text("FAQ", (ctx) => ctx.reply(faqMessage, { parse_mode: "Markdown" }))
  .url("Website", "https://panana-predictions.xyz/")
  .url("Follow on X", "https://x.com/panana_predict");

bot.use(welcomeMenu);

bot.command("start", async (ctx) => {
  await ctx.replyWithPhoto(
    "https://app.panana-predictions.xyz/pp-preview-purple.jpg",
    {
      caption: "Mr. Peeltos greets you 😎🤙🏼 Welcome to Panana Predictions 🍌",
    }
  );

  await ctx.reply(welcomeMessage, {
    parse_mode: "Markdown",
    reply_markup: welcomeMenu,
  });

  sendDebugMessage(ctx);
});

bot.command("help", async (ctx) => {
  ctx.reply(faqMessage, { parse_mode: "Markdown" });
});

// bot.on("message:text", async (ctx) => {
//   console.log(ctx);
//   await ctx.reply(ctx.message.text);
// });

bot.callbackQuery("notification-setup", async (ctx) => {
  const attachedUrl = (
    ctx?.callbackQuery?.message?.reply_markup?.inline_keyboard?.[0]?.[1] as any
  )?.url;

  if (attachedUrl && ctx.from) {
    const url = new URL(attachedUrl);
    const marketAddress = url.pathname.split("/").at(-1);

    const messageKind = url.searchParams.get("messageKind");
    const timeToSend = url.searchParams.get("timeToSend");

    if (messageKind && timeToSend) {
      await storeTelegramNotification(
        marketAddress as Address,
        ctx.from.id,
        timeToSend as string,
        messageKind as MessageKind
      );
    }
  }

  await ctx.answerCallbackQuery();
});

bot.callbackQuery("news-2-switchboard", async (ctx) => {
  const message = `🔮 <b><a href="https://switchboard.xyz/">Switchboard Oracles</a></b>
We use Switchboard Oracles to fetch real-time crypto prices directly inside our smart contracts. This ensures that all market predictions are based on accurate and up-to-date data, giving you confidence in your predictions.`;

  const menu = new InlineKeyboard()
    .text("📊 NODIT", "news-2-nodit")
    .text("📈 MEXC", "news-2-mexc")
    .text("🖥️ TradingView", "news-2-tradingview")
    .row()
    .text("↸", "news-2-close");

  bot.api.sendMessage(ctx.from.id, message, {
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
    reply_markup: menu,
  });

  if (
    ctx.callbackQuery?.message?.message_id &&
    ctx.callbackQuery?.message?.text !== undefined
  ) {
    bot.api.deleteMessage(ctx.from.id, ctx.callbackQuery.message.message_id);
  }

  await ctx.answerCallbackQuery();
});

bot.callbackQuery("news-2-nodit", async (ctx) => {
  const message = `📊 <b><a href="https://nodit.io/">NODIT</a></b>
Historical data is key for any prediction market. That's why we’ve integrated NODIT to query historical data on the Aptos network. This allows us to offer in-depth insights, so you can make well-informed predictions based on past trends.`;

  const menu = new InlineKeyboard()
    .text("🔮 Switchboard Oracles", "news-2-switchboard")
    .text("📈 MEXC", "news-2-mexc")
    .text("🖥️ TradingView", "news-2-tradingview")
    .row()
    .text("↸", "news-2-close");

  bot.api.sendMessage(ctx.from.id, message, {
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
    reply_markup: menu,
  });

  if (
    ctx.callbackQuery?.message?.message_id &&
    ctx.callbackQuery?.message?.text !== undefined
  ) {
    bot.api.deleteMessage(ctx.from.id, ctx.callbackQuery.message.message_id);
  }

  await ctx.answerCallbackQuery();
});

bot.callbackQuery("news-2-mexc", async (ctx) => {
  const message = `📈 <b><a href="https://www.mexc.com/">MEXC</a></b>
We utilize MEXC to pull Kline data and analyze market trends. This gives you a clear view of market movements, helping you make smarter, more strategic predictions.`;

  const menu = new InlineKeyboard()
    .text("🔮 Switchboard Oracles", "news-2-switchboard")
    .text("📊 NODIT", "news-2-nodit")
    .text("🖥️ TradingView", "news-2-tradingview")
    .row()
    .text("↸", "news-2-close");

  bot.api.sendMessage(ctx.from.id, message, {
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
    reply_markup: menu,
  });

  if (
    ctx.callbackQuery?.message?.message_id &&
    ctx.callbackQuery?.message?.text !== undefined
  ) {
    bot.api.deleteMessage(ctx.from.id, ctx.callbackQuery.message.message_id);
  }

  await ctx.answerCallbackQuery();
});

bot.callbackQuery("news-2-tradingview", async (ctx) => {
  console.log(ctx);
  const message = `🖥️ <b><a href="https://www.tradingview.com/">TradingView</a></b>
For a seamless user experience, we display professional-grade crypto charts through TradingView. With this integration, you can visually track price trends and market fluctuations in real time, right within our platform.`;

  const menu = new InlineKeyboard()
    .text("🔮 Switchboard Oracles", "news-2-switchboard")
    .text("📊 NODIT", "news-2-nodit")
    .text("📈 MEXC", "news-2-mexc")
    .row()
    .text("↸", "news-2-close");

  bot.api.sendMessage(ctx.from.id, message, {
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
    reply_markup: menu,
  });

  if (
    ctx.callbackQuery?.message?.message_id &&
    ctx.callbackQuery?.message?.text !== undefined
  ) {
    bot.api.deleteMessage(ctx.from.id, ctx.callbackQuery.message.message_id);
  }

  await ctx.answerCallbackQuery();
});

bot.callbackQuery("news-2-close", async (ctx) => {
  if (ctx.callbackQuery?.message?.message_id) {
    bot.api.deleteMessage(ctx.from.id, ctx.callbackQuery.message.message_id);
  }

  await ctx.answerCallbackQuery({ text: "🍌" });
});

export const POST = webhookCallback(bot, "std/http");
