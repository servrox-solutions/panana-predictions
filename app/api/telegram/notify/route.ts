import { sendNotificationSetupMessage } from "@/lib/send-telegram-message";

export async function POST(request: Request) {
  const {
    market_address: marketAddress,
    telegram_user_id: telegramUserId,
    message_kind: messageKind,
  } = await request.json();

  await sendNotificationSetupMessage(
    telegramUserId,
    messageKind,
    marketAddress
  );

  return Response.json({ success: true });
}
