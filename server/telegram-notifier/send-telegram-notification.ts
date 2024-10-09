import type { MessageKind } from "../../lib/types/market";
import { escapeMarkdownV2, getMessageByKind } from "../../lib/utils";
import { Bot } from "grammy";

export async function sendTelegramNotification(
  telegramUserId: number,
  marketAddress: string,
  messageKind: MessageKind
) {
  const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
  const message = escapeMarkdownV2(
    `🚨 **${getMessageByKind(
      messageKind
    )}.** Do your last bet [here](https://app.panana-predictions.xyz/markets/${marketAddress})`
  );

  await bot.api.sendMessage(telegramUserId, message, {
    parse_mode: "MarkdownV2",
    link_preview_options: { is_disabled: true },
  });
}
