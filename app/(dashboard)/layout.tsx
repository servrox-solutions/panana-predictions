import { Header } from "@/components/header";
import { SidenavDesktop } from "@/components/sidenav/sidenav-desktop";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidenavDesktop />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}
