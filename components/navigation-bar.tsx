"use client";

import { FloatingDockDesktop } from "@/components/ui/floating-dock";

import {
  Home,
  ChartCandlestick,
  LineChart,
  Medal,
  FlaskConical,
} from "lucide-react";

export function NavigationBar() {
  const links = [
    {
      title: "Dashboard",
      icon: (
        <Home className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/",
    },

    {
      title: "Markets",
      icon: (
        <ChartCandlestick className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/markets",
    },
    {
      title: "Analytics",
      icon: (
        <LineChart className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/analytics",
    },
    // {
    //   title: "Aceternity UI",
    //   icon: (
    //     <Image
    //       src="https://assets.aceternity.com/logo-dark.png"
    //       width={20}
    //       height={20}
    //       alt="Aceternity Logo"
    //     />
    //   ),
    //   href: "#",
    // },
    {
      title: "Ranking",
      icon: (
        <Medal className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/ranking",
    },

    {
      title: "Test",
      icon: (
        <FlaskConical className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/test",
    },
  ];
  return (
    <div className="fixed z-50 w-full sm:w-auto -translate-x-1/2  bottom-0 sm:bottom-4 left-1/2 sm:hidden">
      <FloatingDockDesktop
        items={links}
        className="flex gap-0 space-x-4 justify-between rounded-none sm:rounded-2xl backdrop-blur-xl bg-transparent dark:bg-transparent"
      />
    </div>
  );
}
