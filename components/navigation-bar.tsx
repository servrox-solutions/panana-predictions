import { SidenavItem } from "./sidenav/sidenav-items";
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
      <div className="grid grid-flow-col auto-cols-fr h-full max-w-lg mx-auto font-medium">
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
