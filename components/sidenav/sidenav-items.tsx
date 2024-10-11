import { Home, ChartCandlestick, User, ChartColumn } from "lucide-react";

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
    name: "Assets",
    icon: <ChartCandlestick />,
    path: "/markets",
  },
  {
    name: "Events",
    icon: <ChartColumn />,
    path: "/eventmarkets",
  },
  {
    name: "Profile",
    icon: <User />,
    path: "/profile",
  },
];
