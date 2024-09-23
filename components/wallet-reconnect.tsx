"use client";

import { useAutoConnect } from "./auto-connect-provider";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

export function WalletReconnect() {
  const { autoConnect, setAutoConnect } = useAutoConnect();

  return (
    <label className="flex items-center gap-4 cursor-pointer">
      <Switch
        id="auto-connect-switch"
        checked={autoConnect}
        onCheckedChange={setAutoConnect}
      />
      <Label htmlFor="auto-connect-switch" className="hidden sm:block">
        Auto reconnect on page load
      </Label>
    </label>
  );
}
