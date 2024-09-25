"use client";

import { useLaunchParams } from "@telegram-apps/sdk-react";
import { SidenavDesktopItem } from "./sidenav-desktop-item";
import { FlaskConical } from "lucide-react";

export function DebugSidenavDesktopItem({
  pathname,
}: {
  pathname: string | null;
}) {
  const debug = useLaunchParams(true)?.startParam === "debug";

  return (
    <>
      {debug && (
        <SidenavDesktopItem
          icon={<FlaskConical />}
          name="Test"
          path="/test"
          preSelected={pathname === "/test"}
        />
      )}
    </>
  );
}
