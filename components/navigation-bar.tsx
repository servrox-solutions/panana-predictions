import { sidenavItems } from "./sidenav/sidenav-items";
import { cn } from "@/lib/utils";
import { headers } from "next/headers";
import { NavigationBarItem } from "./navigation-bar-item";

export function NavigationBar() {
  const headerList = headers();
  const pathname = headerList.get("x-current-path");

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full bg-white/30 backdrop-blur-lg border-t border-gray-200 dark:bg-gray-700/30 dark:border-gray-600 pt-1 [--base-pb:0.25rem] pb-safe-combined transition-all max-h-16 sm:hidden">
      <div
        className={cn(
          "grid h-full max-w-lg mx-auto font-medium",
          sidenavItems.length === 6 && "grid-cols-6",
          sidenavItems.length === 5 && "grid-cols-5",
          sidenavItems.length === 4 && "grid-cols-4",
          sidenavItems.length === 3 && "grid-cols-3",
          sidenavItems.length === 2 && "grid-cols-2"
        )}
      >
        {sidenavItems.map((item) => (
          <NavigationBarItem
            key={item.name}
            href={item.path}
            label={item.name}
            icon={item.icon}
            preSelected={pathname === item.path}
          />
        ))}
      </div>
    </div>
  );
}
