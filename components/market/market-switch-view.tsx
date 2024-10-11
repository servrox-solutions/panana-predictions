"use client";

import { useMarketDataStore } from "@/lib/atoms/useMarketDataStore";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

export function MarketSwitchView() {
  const { displayMarketData, setDisplayMarketData } = useMarketDataStore();

  // Define handlers outside of the render to avoid inline functions
  const handleOpenMarketsClick = () => setDisplayMarketData("open");
  const handleClosedMarketsClick = () => setDisplayMarketData("closed");

  return (
    <Tabs
      defaultValue={
        displayMarketData === "open" ? "openMarkets" : "closedMarkets"
      }
    >
      <TabsList>
        <TabsTrigger
          value="openMarkets"
          onClick={handleOpenMarketsClick} // Use predefined handler
        >
          Open Markets
        </TabsTrigger>
        <TabsTrigger
          value="closedMarkets"
          onClick={handleClosedMarketsClick} // Use predefined handler
        >
          Running Markets
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
