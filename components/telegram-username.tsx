"use client";

import { cn } from "@/lib/utils";
import WebApp from "@twa-dev/sdk";

export function TelegramUsername({ className }: { className?: string }) {
  const username = WebApp.initDataUnsafe.user?.username;
  return <>{username && <div className={cn(className)}>`@${username}`</div>}</>;
}
