import { Home, ChartCandlestick, User } from "lucide-react";

export interface SidenavItem {
  name: string;
  path: string;
  icon: JSX.Element;
}

export const sidenavItems: SidenavItem[] = [
  {
    name: "Dashboard",
    icon: <Home />,
    path: "/dashboard",
  },
  {
    name: "Markets",
    icon: <ChartCandlestick />,
    path: "/markets",
  },
  {
    name: "Profile",
    icon: <User />,
    path: "/profile",
  },
];
