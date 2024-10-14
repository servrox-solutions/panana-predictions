import { sendNotificationSetupMessage } from "@/lib/send-telegram-message";

export async function POST(request: Request) {
  const {
    market_address: marketAddress,
    telegram_user_id: telegramUserId,
    message_kind: messageKind,
    time_to_send: timeToSend,
  } = await request.json();

  await sendNotificationSetupMessage(
    telegramUserId,
    messageKind,
    marketAddress,
    timeToSend,
    true
  );

  return Response.json({ success: true });
}
