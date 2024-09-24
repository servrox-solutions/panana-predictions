"use client";

import { cn } from "@/lib/utils";

export function TelegramUsername({ className }: { className?: string }) {
  const username = window.Telegram.WebApp.initDataUnsafe.user?.username;
  return <>{username && <div className={cn(className)}>`@${username}`</div>}</>;
}
