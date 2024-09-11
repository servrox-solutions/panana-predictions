import Link from "next/link";

import {
  Banana,
  Home,
  LineChart,
  Settings,
  Medal,
  FlaskConical,
} from "lucide-react";
import { headers } from "next/headers";
import { SidenavItem } from "./sidenav-item";

export function Sidenav() {
  const headerList = headers();
  const pathname = headerList.get("x-current-path");

  const items = [
    {
      name: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      path: "/",
    },
    {
      name: "Analytics",
      icon: <LineChart className="h-5 w-5" />,
      path: "/analytics",
    },
    {
      name: "Ranking",
      icon: <Medal className="h-5 w-5" />,
      path: "/ranking",
    },
    {
      name: "Test",
      icon: <FlaskConical className="h-5 w-5" />,
      path: "/test",
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="#"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Banana className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">Panana Pre.</span>
        </Link>

        {items.map((item) => (
          <SidenavItem
            key={item.name}
            icon={item.icon}
            name={item.name}
            path={item.path}
            preSelected={pathname === item.path}
          />
        ))}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <SidenavItem
          icon={<Settings className="h-5 w-5" />}
          name="Settings"
          path="/settings"
          preSelected={pathname === "/settings"}
        />
      </nav>
    </aside>
  );
}
