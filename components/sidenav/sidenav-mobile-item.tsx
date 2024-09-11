"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cloneElement } from "react";

export interface SidenavMobileItemProps {
  path: string;
  preSelected?: boolean;
  icon: JSX.Element;
  name: string;
}

export function SidenavMobileItem({
  path,
  preSelected,
  icon,
  name,
}: SidenavMobileItemProps) {
  const pathname = usePathname();

  return (
    <Link
      href={path}
      className={cn(
        "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
        (!pathname && preSelected) ||
          (pathname && pathname === path && "text-foreground")
      )}
    >
      {cloneElement(icon, { className: "h-5 w-5" })}
      {name}
    </Link>
  );
}
