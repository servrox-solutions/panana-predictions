import { createClient } from "./create-client";
import { scheduleNotification } from "../schedule-notification";
import { jobScheduler } from "../job-scheduler";

const supabase = createClient({ isAdmin: true });

export function listenToRealtimeUpdates() {
  supabase
    .channel("secure_schema:telegram_notifications")
    .on(
      "postgres_changes",
      { event: "*", schema: "secure_schema", table: "telegram_notifications" },
      (payload) => handleRealtimeEvent(payload)
    )
    .subscribe();

  console.log("Listening to real-time updates for telegram_notifications...");
}

async function handleRealtimeEvent(payload: any) {
  const eventType = payload.eventType;

  console.log(`Received ${eventType} event:`, payload);

  if (eventType === "INSERT") {
    const notification = payload.new;
    const job = await scheduleNotification(notification);
    jobScheduler.addJob(notification.id, job);
    console.log(
      `Scheduled new notification. Amount of scheduled jobs: ${
        jobScheduler.getAllJobs().size
      }`
    );
  } else if (eventType === "UPDATE") {
    const updatedNotification = payload.new;
    const { id, deleted_at } = updatedNotification;

    if (deleted_at) {
      jobScheduler.removeJob(id);
    } else {
      console.log(`Updated notification: ${updatedNotification.id}`);
    }
  }
}
