import {
  Home,
  LineChart,
  Medal,
  FlaskConical,
  ChartCandlestick,
} from "lucide-react";

export interface SidenavItem {
  name: string;
  path: string;
  icon: JSX.Element;
}

export const sidenavItems: SidenavItem[] = [
  {
    name: "Dashboard",
    icon: <Home />,
    path: "/",
  },
  {
    name: "Markets",
    icon: <ChartCandlestick />,
    path: "/markets",
  },
  {
    name: "Analytics",
    icon: <LineChart />,
    path: "/analytics",
  },
  {
    name: "Ranking",
    icon: <Medal />,
    path: "/ranking",
  },
  {
    name: "Test",
    icon: <FlaskConical />,
    path: "/test",
  },
];
