"use client";

import { useMarketDataStore } from "@/lib/atoms/useMarketDataStore";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export function SwitchMarketView() {
  const { displayMarketData, setDisplayMarketData } = useMarketDataStore();

  return (
    <Tabs
      defaultValue={
        displayMarketData === "open" ? "openMarkets" : "closedMarkets"
      }
    >
      <TabsList>
        <TabsTrigger
          value="openMarkets"
          onClick={() => setDisplayMarketData("open")}
        >
          Open Markets
        </TabsTrigger>
        <TabsTrigger
          value="closedMarkets"
          onClick={() => setDisplayMarketData("closed")}
        >
          Running Markets
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
