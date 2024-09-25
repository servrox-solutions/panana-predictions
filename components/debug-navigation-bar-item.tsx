"use client";

import { useLaunchParams } from "@telegram-apps/sdk-react";
import { FlaskConical } from "lucide-react";
import { NavigationBarItem } from "./navigation-bar-item";

export function DebugNavigationBarItem({
  pathname,
}: {
  pathname: string | null;
}) {
  const debug = useLaunchParams(true)?.startParam === "debug";

  return (
    <>
      {debug && (
        <NavigationBarItem
          icon={<FlaskConical />}
          href="/test"
          label="Test"
          preSelected={pathname === "/test"}
        />
      )}
    </>
  );
}
