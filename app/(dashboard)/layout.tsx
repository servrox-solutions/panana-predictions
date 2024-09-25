import { Header } from "@/components/header";
import { NavigationBar } from "@/components/navigation-bar";
import { SidenavDesktop } from "@/components/sidenav/sidenav-desktop";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen w-full lg:bg-[url('/bg-light.jpg')] lg:dark:bg-[url('/bg-dark.jpg')] bg-[url('/bg-light-mobile.jpg')] dark:bg-[url('/bg-dark-mobile.jpg')] bg-no-repeat bg-cover bg-top">
      <SidenavDesktop />
      <div className="flex flex-col flex-shrink-0 sm:pl-14 max-h-screen">
        <Header />
        <main className="overflow-auto flex-shrink-0 max-h-[calc(100vh-130px)] min-h-[calc(100vh-130px)] sm:max-h-[calc(100vh-65px)] sm:min-h-[calc(100vh-65px)] sm:pb-8">
          {children}
        </main>
        <NavigationBar />
      </div>
    </div>
  );
}
