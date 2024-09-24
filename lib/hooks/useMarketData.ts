import { useMemo, useCallback } from "react";
import { useFuzzySearchList } from "@nozbe/microfuzz/react";
import { MarketData } from "@/lib/types/market";
import { useMarketDataStore } from "../atoms/useMarketDataStore";

export function useMarketData() {
  const { marketData, setMarketData, searchTerm, setSearchTerm } =
    useMarketDataStore();

  // Helper function to convert Map objects to a searchable string
  const mapToString = useCallback((map?: Map<any, any>): string => {
    if (!map) return "";
    return Array.from(map.entries())
      .map(([key, value]) => `${key}:${value}`)
      .join(", ");
  }, []);

  // Memoized getText function for fuzzy search
  const getText = useCallback(
    (item: MarketData): (string | null)[] => [
      item.name ?? "",
      item.address ?? "",
      item.tradingPair?.one ?? "",
      item.tradingPair?.two ?? "",
      item.creator ?? "",
      item.startPrice?.toString() ?? "",
      item.startTime?.toString() ?? "",
      item.endTime?.toString() ?? "",
      item.minBet?.toString() ?? "",
      item.upBetsSum?.toString() ?? "",
      item.downBetsSum?.toString() ?? "",
      item.fee?.toString() ?? "",
      item.priceUp !== null && item.priceUp !== undefined
        ? item.priceUp.toString()
        : null,
      item.priceDelta?.toString() ?? "",
      mapToString(item.upBets),
      mapToString(item.downBets),
      mapToString(item.userVotes),
      item.upVotesSum?.toString() ?? "",
      item.downVotesSum?.toString() ?? "",
      item.upWinFactor?.toString() ?? "",
      item.downWinFactor?.toString() ?? "",
    ],
    [mapToString]
  );

  // Call useFuzzySearchList at the top level
  const fuzzyResults = useFuzzySearchList({
    list: marketData || [],
    queryText: searchTerm || "",
    getText,
    mapResultItem: ({ item }) => item,
  });

  // Determine filteredMarketData based on searchTerm
  const filteredMarketData = useMemo(() => {
    if (!marketData || marketData.length === 0) return [];
    if (!searchTerm) return marketData;
    return fuzzyResults;
  }, [marketData, searchTerm, fuzzyResults]);

  // Memoized function to add or update market data
  const addMarketData = useCallback(
    (newData: MarketData) => {
      setMarketData((prev) => {
        const existingIndex = prev.findIndex(
          (data) => data.address === newData.address
        );
        if (existingIndex !== -1) {
          // Update existing entry
          const updatedData = [...prev];
          updatedData[existingIndex] = newData;
          return updatedData;
        }
        // Add new entry
        return [...prev, newData];
      });
    },
    [setMarketData]
  );

  return {
    marketData,
    filteredMarketData,
    addMarketData,
    searchTerm,
    setSearchTerm,
  };
}