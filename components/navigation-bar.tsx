import { SidenavItem } from "./sidenav/sidenav-items";
import { headers } from "next/headers";
import { NavigationBarItem } from "./navigation-bar-item";
import { Home, ChartCandlestick, User, ChartColumn } from "lucide-react";
import { DebugNavigationBarItem } from "./debug-navigation-bar-item";

const items: SidenavItem[] = [
  {
    name: "Dashboard",
    icon: <Home />,
    path: "/dashboard",
  },
  {
    name: "Assets",
    icon: <ChartCandlestick />,
    path: "/markets",
  },
  {
    name: "Events",
    icon: <ChartColumn />,
    path: "/eventmarkets",
  },
  {
    name: "Profile",
    icon: <User />,
    path: "/profile",
  },
];

export async function NavigationBar() {
  const headerList = await headers();
  const pathname = headerList.get("x-current-path");

  return (
    <div className="w-full bg-white/30 backdrop-blur-lg border-t border-gray-200 dark:bg-gray-700/30 dark:border-gray-600 pt-2 pb-[calc(0.5rem+var(--safe-area-inset-bottom))] px-3 transition-all -mb-[--safe-area-inset-bottom]">
      <div className="grid grid-flow-col auto-cols-fr max-w-lg mx-auto font-medium">
        {items.map((item) => (
          <NavigationBarItem
            key={item.name}
            href={item.path}
            label={item.name}
            icon={item.icon}
            preSelected={pathname?.startsWith(item.path) ?? false}
          />
        ))}
        <DebugNavigationBarItem pathname={pathname} />
      </div>
    </div>
  );
}
