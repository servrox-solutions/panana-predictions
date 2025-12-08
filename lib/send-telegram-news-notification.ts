"use server";

import { Bot, InlineKeyboard } from "grammy";
import { createClient } from "./supabase/create-client";

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token)
  throw new Error("TELEGRAM_BOT_TOKEN environment variable not found.");

const bot = new Bot(token);

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
    case 3: {
      messageOne = `🔮 <b>Knowledge Transfer Before the Weekend!</b> 🔮

Hey Panana fam, it’s Mr. Peeltos 🍌here, with some key insights before we roll into the weekend! Let’s dive into what we’ve been working on 🚀

📍 <b>Current State:</b>
You can make predictions without more complex functions like share trading for now. In the given time for the Aptos Code Collision Hackathon, we focused on delivering core functionality—straightforward predictions ⚡

💡 <b>What are Shares?</b>
Shares add flexibility. When you make a prediction, you buy shares in an outcome. If the market moves in your favor, you can sell early and lock in profits—giving you more control! 💼

🎯 <b>What’s Next:</b>
We’re launching on Aptos Mainnet with crypto predictions and an optimized UI integrated with Telegram. After that, we’ll focus on shares for real-world events 🌍🚀

🎉 That’s the update! Have a great weekend from Mr. Peeltos 🍹 Let’s go bananas again next week! 🍌🔥
`;

      imageUrl = "https://app.panana-predictions.xyz/peeltos_approved.png";

      menuOne.url(
        "Join our Community Group 🍌",
        `https://t.me/+uStUBG4k0nRkMzZi`
      );

      break;
    }
    case 4: {
      messageOne = `📢 <b>Unlocking the Power of Panana’s Brain!</b> 🍌🧠

Welcome to the future of predictions, where intelligence meets fun! Check out our <b>Automated Crypto Market Resolution</b>—powered by Panana’s own “banana brain”! 🧠⚡

Using <i>decentralized oracles</i>, we guarantee accurate and fast outcomes for all crypto markets. This also enables us to resolve every prediction automatically in a single transaction, without any delays! 🔄

And if a technical glitch occurs, you can step in and resolve it—thus we keep it decentralized and ensure no single point of failure. 💪✨

Our mission is simple: to make crypto predictions smooth, reliable, and fun. So let the banana brain work its magic, and get ready to <b>go bananas</b> with Panana Predictions! 🍌💡
`;

      imageUrl = "https://app.panana-predictions.xyz/banana_brain.png";

      menuOne.url(
        "Join our Community Group 🍌",
        `https://t.me/+uStUBG4k0nRkMzZi`
      );

      break;
    }
    case 5: {
      messageOne = `🎉 <b>Big News from Panana Predictions!</b> 🎉

We’re beyond excited to announce that Panana Predictions is a FINALIST in the <a href="https://aptosfoundation.org/events/code-collision">Aptos Code Collision Hackathon</a>! 🚀 Countless hours of coding, late-night brainstorming, and teamwork have brought us to this point, and we’re ready to show the world what we’ve built! 🌐💡

A huge shoutout to <a href="https://dorahacks.io/hackathon/code-collision">DoraHacks</a> and all the mentors who made this possible. Your support has been incredible, and we’re pumped to be a part of this journey with you all! 🙏

📅 Mark your calendars! This Friday, <b>Nov 1 at 2:30 PM UTC</b>, we’ll be showcasing Panana Predictions LIVE at the Hackathon Demo Day. Catch us and 15 other top teams on YouTube here: <a href="https://youtube.com/live/QbnTo19-i9o">Watch Live</a> 🎥✨

Let’s bring it home, team! 🏆 This is just the beginning for Panana Predictions, and we can’t wait to share what’s next. Stay tuned! 🍌🔥
`;

      imageUrl = "https://app.panana-predictions.xyz/track_finalists.jpg";

      menuOne.url(
        "Join our Community Group 🍌",
        `https://t.me/+uStUBG4k0nRkMzZi`
      );

      break;
    }
    case 6: {
      messageOne = `⏰ <b>Demo Day Countdown!</b> ⏰

Join us as Panana Predictions goes live at the Aptos Code Collision Hackathon Demo Day! 🚀 We’ll showcase our product and reveal insights—don’t miss it!

📅 <b>When:</b> Nov 1 at 2:30 PM UTC  
📺 <b>Watch here:</b> <a href="https://youtube.com/live/QbnTo19-i9o">YouTube Live</a> or <a href="https://www.binance.com/en/live/video?roomId=2231523">Binance Live</a> 🎥

Tune in and see how we’re shaping the future of prediction markets. Let’s go bananas! 🍌🔥
`;

      imageUrl = "https://app.panana-predictions.xyz/news_countdown.png";

      menuOne.url(
        "Join our Community Group 🍌",
        `https://t.me/+uStUBG4k0nRkMzZi`
      );

      break;
    }
    case 7: {
      messageOne = `🍌 <b>CPPP Update!</b> 🍌  
<tg-spoiler><i>Classical Panana Predictions Progress Update</i></tg-spoiler>

Hey everyone! Here’s a quick look at what’s been happening as we gear up for Aptos Mainnet Launch! 🚀

1. <b>UI Rework</b> 🎨 – Big thanks to our designer friends and feedback groups for helping us give the UI a sleek, user-friendly glow-up. Implementation is underway, and we’re sure you’ll love it!

2. <b>Smart Contract Adjustments</b> 🔒 – We’re optimizing smart contracts for smoother performance and future flexibility. Honestly, <i>Move</i> has stolen my banana👩‍❤️‍👨 It lets us build complex features with incredible security. <s>Object</s> Banana ownership for the win! 🏆

3. <b>Networking & Partnerships</b> 🌐 – The Aptos ecosystem is truly amazing! So many inspiring projects and people keep us motivated to push forward.

That’s all for now! Mr. Peeltos signing off 🍹 Keep testing and sharing feedback. Next up: <tg-spoiler>MAINNET LAUNCH</tg-spoiler>! 🍌🔥
`;

      imageUrl = "https://app.panana-predictions.xyz/brain.png";

      menuOne.url("Join our CCG 🍌", `https://t.me/+uStUBG4k0nRkMzZi`);

      break;
    }
    case 8: {
      messageOne = `🇺🇸🍌 <b>Mr. Peeltos for President!</b> 🍌🇺🇸

Jokes aside, the 2024 USA election is already decided. Polymarket called the election in favor of <b>Donald Trump</b> before any media outlet, showing far greater accuracy than pollsters’ 50:50 guesses.

💸 <i>Billions were traded</i> 💸

Unlike traditional media that thrives on suspense, prediction markets prioritize <b>accuracy</b> and make the call when it’s clear.

That’s why we believe in the power and importance of <b>prediction markets</b>. 🍌✨
`;

      imageUrl = "https://app.panana-predictions.xyz/Character_MAGA2.jpg";

      menuOne.url(
        "Join our Community Group 🍌",
        `https://t.me/panana_predictions`
      );

      break;
    }
    case 9: {
      messageOne = `🍌 <b>New Week Vibes from Mr. Peeltos</b> 🍌

Panana fam, we’re starting the week <b>strong!</b> We hit <b>100 followers on X</b>, crypto prices are <b>soaring</b> 📈🔥 and we’re making big strides toward the <b>Aptos Mainnet Launch</b> 🚀

Thanks for the energy you bring ⚡️ let’s keep building and go bananas together 🍌🔥

<b>Up, up</b> ☝🏼😎☝🏼 that's where we're headed!
`;

      imageUrl = "https://app.panana-predictions.xyz/peeltos-hawai.jpg";

      menuOne.url(
        "Join our Community Group 🍌",
        `https://t.me/panana_predictions`
      );

      break;
    }
    case 10: {
      messageOne = `⏰ <b>Countdown: 10 minutes!</b> ⏰

Hey guys 🍌 the official <a href="https://aptosfoundation.org/events/code-collision">Code Collision Hackathon</a> winners will be announced in 10 minutes (9am ET) on <a href="https://x.com/Aptos"><b>X</b></a>! 🍌🔥

Taking the <i>MOVE</i> to build Panana Predictions created the Panana fam 💪🍌— which will in any case continue to grow! 🕺💃

Stay tuned for the big reveal! 🚀
`;

      imageUrl = "https://app.panana-predictions.xyz/peeltos_banner.gif";

      menuOne.url(
        "Join our Community Group 🍌",
        `https://t.me/panana_predictions`
      );

      break;
    }
    case 11: {
      messageOne = `🎉 <b>And the Results Are In</b> 🎉

We are the <tg-spoiler><b>WINNER 🏆</b></tg-spoiler> of the <b>DeFi / RWA Code Challenge</b> and were even able to win more challenges 🍌🔥

1️⃣🏆 <b>DeFi / RWA</b> <a href="https://x.com/Aptos/status/1857423397824913666">see here</a>  
1️⃣🏆 <b>Aptos Indexer Challenge with Nodit</b> <a href="https://x.com/Aptos/status/1857423552229838934">see here</a>    
2️⃣🏆 <b>Mizu Wallet's Telegram Integration Challenge</b> <a href="https://x.com/Aptos/status/1857423640629014725">see here</a>  
#️⃣🏆 <b>MEXC Venture's Choice</b> <a href="https://x.com/Aptos/status/1857423619225432369">see here</a>

Congratulations to <b>all the winners</b> and the incredible <i>MOVES</i> during the hackathon 🥳 We’re <b>proud</b> of our placement and so <b>grateful</b> for the support along the way! This is just the beginning—let’s keep building 🚀🍌🔥
`;

      imageUrl = "https://app.panana-predictions.xyz/1.jpg";

      menuOne.url(
        "Join the Winner Group 🍌",
        `https://t.me/panana_predictions`
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
        // TODO: sendAnimation check if imageUrl ends with .gif
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
