import { Home, FlaskConical, ChartCandlestick } from "lucide-react";

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
  ...(process.env.NODE_ENV === "development"
    ? [
        {
          name: "Test",
          icon: <FlaskConical />,
          path: "/test",
        },
      ]
    : []),
];
