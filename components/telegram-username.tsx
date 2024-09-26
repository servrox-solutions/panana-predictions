"use client";

import { cn } from "@/lib/utils";
import { useInitData, useLaunchParams } from "@telegram-apps/sdk-react";

export function TelegramUsername({ className }: { className?: string }) {
  const initData = useInitData(true);
  const launchParams = useLaunchParams(true);

  const username = initData?.user?.username;
  return (
    <>{launchParams?.platform !== 'mock' && username && <div className={cn(className)}>{`@${username}`}</div>}</>
  );
}
