"use client";

import { useLaunchParams } from "@telegram-apps/sdk-react";
import { FlaskConical } from "lucide-react";
import { SidenavMobileItem } from "./sidenav-mobile-item";

export function DebugSidenavMobileItem({
  pathname,
}: {
  pathname: string | null;
}) {
  const debug = useLaunchParams(true)?.startParam === "debug";

  return (
    <>
      {debug && (
        <SidenavMobileItem
          icon={<FlaskConical />}
          name="Test"
          path="/test"
          preSelected={pathname === "/test"}
        />
      )}
    </>
  );
}
