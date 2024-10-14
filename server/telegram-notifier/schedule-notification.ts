import { Cron } from "croner";
import type { MessageKind } from "../../lib/types/market";
import { sendNotification } from "../../lib/send-telegram-message";
import { jobScheduler } from "./job-scheduler";

export async function scheduleNotification(notification: any): Promise<Cron> {
  const { id, time_to_send, telegram_user_id, market_address, message_kind } =
    notification;

  const timeToSend = new Date(time_to_send);

  const job = Cron(timeToSend, async () => {
    await sendNotification(
      telegram_user_id,
      message_kind as MessageKind,
      market_address
    );

    jobScheduler.removeJob(id);
  });

  console.log(`Notification with ID: ${id} scheduled for ${time_to_send}`);

  return job;
}
