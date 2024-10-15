import { useState, useEffect, useRef } from "react";
import { AvailableMarket } from "../get-available-markets";
import { initializeMarket } from "../initialize-market";
import { MarketData, MarketType } from "../types/market";
import { useMarketData } from "./useMarketData";

export function useMarket(
  availableMarket: AvailableMarket<MarketType>,
  autoRefreshInterval: number,
  initialData?: MarketData
) {
  const [marketData, setMarketData] = useState<MarketData | null>(
    initialData || null
  );
  const { addMarketData } = useMarketData(); // Use addMarketData only for managing global state
  const fetchIntervalId = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshAttributes = async () => {
    const newMarketData = await initializeMarket(availableMarket);
    setMarketData(newMarketData);

    // Add or update the market data in the global atom
    addMarketData(newMarketData); // This handles both adding new and updating existing entries
    console.log("Market attributes updated.");
  };

  useEffect(() => {
    // If initialData is not provided, fetch data on mount
    if (!initialData) {
      refreshAttributes().catch((err) =>
        console.error("Error initializing market:", err)
      );
    }

    // Set up auto-refresh if interval is provided
    if (autoRefreshInterval > 0) {
      fetchIntervalId.current = setInterval(() => {
        refreshAttributes().catch((err) =>
          console.error("Error refreshing market:", err)
        );
      }, autoRefreshInterval);

      console.log(`Market will refresh every ${autoRefreshInterval} ms.`);
    }

    // Cleanup on unmount
    return () => {
      if (fetchIntervalId.current) {
        clearInterval(fetchIntervalId.current);
        fetchIntervalId.current = null;
        console.log("Auto-refresh stopped.");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs once on mount

  const stopAutoRefresh = () => {
    if (fetchIntervalId.current) {
      clearInterval(fetchIntervalId.current);
      fetchIntervalId.current = null;
      console.log("Auto-refresh stopped.");
    }
  };

  return {
    marketData,
    refreshAttributes,
    stopAutoRefresh,
  };
}
