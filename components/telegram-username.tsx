"use client";

import { cn } from "@/lib/utils";
import { useInitData } from "@telegram-apps/sdk-react";

export function TelegramUsername({ className }: { className?: string }) {
  const initData = useInitData(true);
  const username = initData?.user?.username;
  return (
    <>{username && <div className={cn(className)}>{`@${username}`}</div>}</>
  );
}
