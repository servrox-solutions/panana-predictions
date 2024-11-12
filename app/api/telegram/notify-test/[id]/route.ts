import { sendNewsNotification } from "@/lib/send-telegram-news-notification";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headersList = await headers();
  const apiKey = headersList.get("apikey");

  if (apiKey !== process.env.TELEGRAM_NOTIFY_API_KEY) {
    return NextResponse.json({ success: false, error: "Invalid API key" });
  }

  const id = parseInt((await params).id);

  try {
    // sendNewsNotification([134685150, 206250454], id);
    // sendNewsNotification([134685150], id);
    sendNewsNotification([], id);
  } catch (error) {
    console.error("Error sending news notification:", error);
    return NextResponse.json({ success: false, error: error });
  }

  return NextResponse.json({ success: true, id });
}
