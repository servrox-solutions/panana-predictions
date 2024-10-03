import { useMemo, useCallback } from "react";
import { useFuzzySearchList } from "@nozbe/microfuzz/react";
import { MarketData } from "@/lib/types/market";
import { useMarketDataStore } from "../atoms/useMarketDataStore";
import { useFilterStore } from "../atoms/useFilterStore";

export function useMarketData() {
  const {
    marketData,
    setMarketData,
    searchTerm,
    setSearchTerm,
    displayMarketData,
    orderBy,
  } = useMarketDataStore();

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

  const { filter } = useFilterStore("markets");

  const isVisible = (checkMarket: MarketData) => {
    const isInMarketTypeDropdownFilter =
      !filter ||
      filter.length === 0 ||
      filter.includes(checkMarket.tradingPair.one);

    const isInSearch =
      !filteredMarketData ||
      filteredMarketData.length === 0 ||
      filteredMarketData.some(
        (market) => market.address === checkMarket?.address
      );

    const isInDisplayMarketData =
      displayMarketData === "open"
        ? checkMarket.startTime > Date.now() / 1000
        : checkMarket.startTime <= Date.now() / 1000;

    return isInMarketTypeDropdownFilter && isInSearch && isInDisplayMarketData;
  };

  const getPosition = (checkMarket: MarketData): string => {
    let position = 0;

    if (orderBy === "newest") {
      position = marketData
        .sort((prev, cur) => cur.createdAt - prev.createdAt)
        .findIndex((market) => market.address === checkMarket.address);
    } else if (orderBy === "oldest") {
      position = marketData
        .sort((prev, cur) => prev.createdAt - cur.createdAt)
        .findIndex((market) => market.address === checkMarket.address);
      // } else if (orderBy === "mostVolume") {
    } else if (orderBy === "upvotes") {
      position = marketData
        .sort((prev, cur) => cur.upVotesSum - prev.upVotesSum)
        .findIndex((market) => market.address === checkMarket.address);
     } else if (orderBy === "downvotes") {
      position = marketData
        .sort((prev, cur) => cur.downVotesSum - prev.downVotesSum)
        .findIndex((market) => market.address === checkMarket.address);
    }
    else {
      position = marketData
        .sort(
          (prev, cur) =>
            cur.upBetsSum +
            cur.downBetsSum -
            (prev.upBetsSum + prev.downBetsSum)
        )
        .findIndex((market) => market.address === checkMarket.address);
    }

    return `${position + 1}`;
  };

  return {
    isVisible,
    getPosition,
    marketData,
    filteredMarketData,
    addMarketData,
    searchTerm,
    setSearchTerm,
  };
}
