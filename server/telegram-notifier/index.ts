import { jobScheduler } from "./job-scheduler";
import { scheduleNotification } from "./schedule-notification";
import { readTelegramNotifications } from "./supabase/read-telegram-notifications";
import { listenToRealtimeUpdates } from "./supabase/realtime-listener";

export const telegramNotifier = async () => {
  const initialRead = await readTelegramNotifications();

  if (!initialRead.success) {
    console.error("Failed to read initial notifications:", initialRead.error);
  }

  const initialNotifications = initialRead.data ?? [];
  console.log("Initial notifications:", initialNotifications);

  for (const notification of initialNotifications) {
    const job = await scheduleNotification(notification);
    jobScheduler.addJob(notification.id, job);
  }

  listenToRealtimeUpdates();
};

(async () => {
  await telegramNotifier();
})();
