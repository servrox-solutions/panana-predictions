"use client";

import { cn } from "@/lib/utils";
import { useAutoConnect } from "./providers/auto-connect-provider";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

export function WalletReconnect({ className, label }: { className?: string, label?: string }) {
  const { autoConnect, setAutoConnect } = useAutoConnect();

  return (
    <label className={cn("flex items-center gap-4 cursor-pointer", className)}>
      <Switch
        id="auto-connect-switch"
        checked={autoConnect}
        onCheckedChange={setAutoConnect}
        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-secondary-foreground"
      />
      <Label htmlFor="auto-connect-switch">{label}</Label>
    </label>
  );
}
