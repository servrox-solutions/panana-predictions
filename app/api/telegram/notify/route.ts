import { getMessageByKind } from "@/lib/utils";
import { Bot } from "grammy";

export async function POST(request: Request) {
  console.log("🍌", request);

  const {
    market_address: marketAddress,
    telegram_user_id: telegramUserId,
    message_kind: messageKind,
  } = await request.json();

  //TODO: this is just a quick test
  const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
  await bot.api.sendMessage(
    telegramUserId,
    `🚨 **${getMessageByKind(
      messageKind
    )}.** Do your last bet [here](https://app.panana-predictions.xyz/markets/${marketAddress})`,
    {
      parse_mode: "MarkdownV2",
      link_preview_options: { is_disabled: true },
    }
  );
  return Response.json({ success: true });
}
