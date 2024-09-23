import { Header } from "@/components/header";
import { NavigationBar } from "@/components/navigation-bar";
import { SidenavDesktop } from "@/components/sidenav/sidenav-desktop";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col lg:bg-[url('/bg-light.jpg')] lg:dark:bg-[url('/bg-dark.jpg')] bg-[url('/bg-light-mobile.jpg')] dark:bg-[url('/bg-dark-mobile.jpg')] bg-no-repeat bg-cover bg-top">
      <SidenavDesktop />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header />
        <main>
          {children}
          <NavigationBar />
        </main>
      </div>
    </div>
  );
}
