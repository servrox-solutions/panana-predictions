import { Cron } from "croner";
import { sendTelegramNotification } from "./send-telegram-notification";
import type { MessageKind } from "../../lib/types/market";
import { jobScheduler } from "./job-scheduler";

export async function scheduleNotification(notification: any): Promise<Cron> {
  const { id, time_to_send, telegram_user_id, market_address, message_kind } =
    notification;

  const timeToSend = new Date(time_to_send);

  const job = Cron(timeToSend, async () => {
    await sendTelegramNotification(
      telegram_user_id,
      market_address,
      message_kind as MessageKind
    );

    jobScheduler.removeJob(id);
  });

  console.log(`Notification with ID: ${id} scheduled for ${time_to_send}`);

  return job;
}
