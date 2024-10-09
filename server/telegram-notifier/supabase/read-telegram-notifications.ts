import { createClient } from "./create-client";

const supabase = createClient({ isAdmin: true });

export async function readTelegramNotifications() {
  try {
    const currentTimestamp = new Date().toISOString();
    const { data, error } = await supabase
      .schema("secure_schema")
      .from("telegram_notifications")
      .select("*")
      .is("deleted_at", null)
      .gt("time_to_send", currentTimestamp);

    if (error) {
      console.error("Error reading telegram notifications:", error);
      return { success: false, error: error };
    }

    return { success: true, data: data };
  } catch (error) {
    console.error("Error reading telegram notifications:", error);
    return { success: false, error: error };
  }
}
