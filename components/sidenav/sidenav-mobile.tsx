import { PanelLeft } from "lucide-react";
import { headers } from "next/headers";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { SidenavMobileItem } from "./sidenav-mobile-item";
import { sidenavItems } from "./sidenav-items";
import { Logo } from "./logo";
import { DebugSidenavMobileItem } from "./debug-sidenav-mobile-item";

export async function SidenavMobile() {
  const headerList = await headers();
  const pathname = headerList.get("x-current-path");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs backdrop-blur-md">
        <Logo />

        <nav className="grid gap-6 text-lg font-medium pt-6">
          {sidenavItems.map((item) => (
            <SidenavMobileItem
              key={item.name}
              icon={item.icon}
              name={item.name}
              path={item.path}
              preSelected={pathname === item.path}
            />
          ))}
          <DebugSidenavMobileItem pathname={pathname} />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
