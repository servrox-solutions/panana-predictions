import { Settings } from "lucide-react";
import { headers } from "next/headers";
import { SidenavDesktopItem } from "./sidenav-desktop-item";
import { sidenavItems } from "./sidenav-items";
import { Logo } from "./logo";
import { DebugSidenavDesktopItem } from "./debug-sidenav-desktop-item";

export async function SidenavDesktop() {
  const headerList = await headers();
  const pathname = headerList.get("x-current-path");

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Logo />

        {sidenavItems.map((item) => (
          <SidenavDesktopItem
            key={item.name}
            icon={item.icon}
            name={item.name}
            path={item.path}
            preSelected={pathname === item.path}
          />
        ))}
        <DebugSidenavDesktopItem pathname={pathname} />
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <SidenavDesktopItem
          icon={<Settings className="h-5 w-5" />}
          name="Settings"
          path="/settings"
          preSelected={pathname === "/settings"}
        />
      </nav>
    </aside>
  );
}
