import { SidenavItem } from "./sidenav/sidenav-items";
import { cn } from "@/lib/utils";
import { headers } from "next/headers";
import { NavigationBarItem } from "./navigation-bar-item";
import { Home, ChartCandlestick, User } from "lucide-react";
import { DebugNavigationBarItem } from "./debug-navigation-bar-item";

const items: SidenavItem[] = [
  {
    name: "Dashboard",
    icon: <Home />,
    path: "/",
  },
  {
    name: "Markets",
    icon: <ChartCandlestick />,
    path: "/markets",
  },
  {
    name: "Profile",
    icon: <User />,
    path: "/profile",
  },
];

export function NavigationBar() {
  const headerList = headers();
  const pathname = headerList.get("x-current-path");

  return (
    <div className="z-50 w-full bg-white/30 backdrop-blur-lg border-t border-gray-200 dark:bg-gray-700/30 dark:border-gray-600 py-2 [--base-pb:0.5rem] pb-safe-combined transition-all max-h-16 min-h-16 sm:hidden">
      <div
        className={cn(
          "grid h-full max-w-lg mx-auto font-medium",
          items.length === 6 && "grid-cols-6",
          items.length === 5 && "grid-cols-5",
          items.length === 4 && "grid-cols-4",
          items.length === 3 && "grid-cols-3",
          items.length === 2 && "grid-cols-2"
        )}
      >
        {items.map((item) => (
          <NavigationBarItem
            key={item.name}
            href={item.path}
            label={item.name}
            icon={item.icon}
            preSelected={pathname === item.path}
          />
        ))}
        <DebugNavigationBarItem pathname={pathname} />
      </div>
    </div>
  );
}
