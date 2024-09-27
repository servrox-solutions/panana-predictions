export const dynamic = "force-dynamic";

export const fetchCache = "force-no-store";

import { Bot, webhookCallback } from "grammy";
import { Menu } from "@grammyjs/menu";

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token)
  throw new Error("TELEGRAM_BOT_TOKEN environment variable not found.");

const bot = new Bot(token);

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
*Frequently Asked Questions*

1. **What is this bot?**
   This bot is designed to assist users by providing useful information and automating common tasks.

2. **How do I use this bot?**
   You can interact with the bot by typing commands or selecting options from the menus.

3. **What features does this bot offer?**
   - Quick access to FAQs
   - Interactive menus
   - Automated responses to common queries
   - Integration with external services

4. **Can I customize the bot’s behavior?**
   Yes, the bot's behavior can be customized to suit your specific needs. Please contact the admin for more details.

5. **Who can I contact for support?**
   For any assistance, you can contact our support team by clicking the button below or emailing us at: [support@bot.com](mailto:support@bot.com).

6. **Where can I learn more about the bot’s capabilities?**
   You can visit our website at [www.botwebsite.com](https://www.botwebsite.com) or refer to the documentation for detailed instructions.

_If you have further questions, feel free to ask!_
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
});

bot.command("help", async (ctx) => {
  ctx.reply(faqMessage, { parse_mode: "Markdown" });
});

// bot.on("message:text", async (ctx) => {
//   console.log(ctx);
//   await ctx.reply(ctx.message.text);
// });

export const POST = webhookCallback(bot, "std/http");
