"use client";

import Link from "next/link";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export interface SidenavItemProps {
  path: string;
  preSelected?: boolean;
  icon: JSX.Element;
  name: string;
}

export function SidenavItem({
  path,
  preSelected,
  icon,
  name,
}: SidenavItemProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={path}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
              (!pathname && preSelected) ||
                (pathname && pathname === path && "bg-accent")
            )}
          >
            {icon}
            <span className="sr-only">{name}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{name}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
