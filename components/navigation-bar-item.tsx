"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { cloneElement } from "react";
import { useHapticFeedback } from "@telegram-apps/sdk-react";

export function NavigationBarItem({
  href,
  label,
  icon,
  preSelected,
}: {
  href: string;
  label: string;
  icon: JSX.Element;
  preSelected: boolean;
}) {
  const pathname = usePathname();
  const hapticFeedback = useHapticFeedback(true);

  return (
    <Link
      href={href}
      onClick={() => hapticFeedback?.impactOccurred("heavy")}
      className={cn(
        "inline-flex flex-col items-center justify-center px-5 group rounded-lg",
        (!pathname && preSelected) ||
          (pathname && pathname.startsWith(href) && "bg-gray-600 bg-opacity-30")
      )}
    >
      {cloneElement(icon, {
        className: cn(
          "w-5 h-5 mt-2 text-gray-200 dark:text-gray-400",
          (!pathname && preSelected) ||
            (pathname &&
              pathname.startsWith(href) &&
              "text-gray-50 dark:text-gray-50")
        ),
      })}
      <span
        className={cn(
          "text-xs mb-1 text-gray-200 dark:text-gray-400",
          (!pathname && preSelected) ||
            (pathname &&
              pathname.startsWith(href) &&
              "text-gray-50 dark:text-gray-50")
        )}
      >
        {label}
      </span>
    </Link>
  );
}
