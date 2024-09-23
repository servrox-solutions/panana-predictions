import Link from "next/link";
import { sidenavItems } from "./sidenav/sidenav-items";
import { cn } from "@/lib/utils";

export function NavigationBar() {
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white/30 backdrop-blur-lg border-t border-gray-200 dark:bg-gray-700/30 dark:border-gray-600 sm:hidden">
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
          <NavItem
            key={item.name}
            href={item.path}
            label={item.name}
            icon={item.icon.type}
          />
        ))}
      </div>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <Link
      href={href}
      className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-100/20 dark:hover:bg-gray-800/20 group"
    >
      <Icon className="w-5 h-5 mb-2 text-gray-200 dark:text-gray-400 group-hover:text-gray-50 dark:group-hover:text-gray-50" />
      <span className="text-xs text-gray-200 dark:text-gray-400 group-hover:text-gray-50 dark:group-hover:text-gray-50">
        {label}
      </span>
    </Link>
  );
}
