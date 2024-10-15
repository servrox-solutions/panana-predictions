import { useMemo, useCallback } from "react";
import { useFuzzySearchList } from "@nozbe/microfuzz/react";
import { EventMarketData } from "@/lib/types/market";
import { useFilterStore } from "../atoms/useFilterStore";
import { useEventMarketDataStore } from '../atoms/useEventMarketDataStore';

export function useEventMarketData() {
  const {
    marketData,
    setMarketData,
    searchTerm,
    setSearchTerm,
    displayMarketData,
    orderBy,
  } = useEventMarketDataStore();

  // Helper function to convert Map objects to a searchable string
  const mapToString = useCallback((map?: Map<any, any>): string => {
    if (!map) return "";
    return Array.from(map.entries())
      .map(([key, value]) => `${key}:${value}`)
      .join(", ");
  }, []);

  // Memoized getText function for fuzzy search
  const getText = useCallback(
    (item: EventMarketData): (string | null)[] => [
      item.name ?? "",
      item.address ?? "",
      item.question ?? "",
      item.rejectionReason ?? "",
      item.creator ?? "",
      item.rules ?? "",
      item.answers.join(),
      item.minBet?.toString() ?? "",
      item.fee?.toString() ?? "",
      mapToString(item.userVotes),
      item.upVotesSum?.toString() ?? "",
      item.downVotesSum?.toString() ?? "",
      item.category?.toString() ?? "",
      item.distribution?.toString() ?? "",
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
  const filteredEventMarketData = useMemo(() => {
    if (!marketData || marketData.length === 0) return [];
    if (!searchTerm) return marketData;
    return fuzzyResults;
  }, [marketData, searchTerm, fuzzyResults]);

  // Memoized function to add or update market data
  const addMarketData = useCallback(
    (newData: EventMarketData) => {
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

  const { filter } = useFilterStore("eventmarkets");

  const isVisible = (checkMarket: EventMarketData) => {
    const isInMarketTypeDropdownFilter =
      !filter ||
      filter.length === 0 ||
      filter.includes(checkMarket.category);

    const isInSearch =
      !filteredEventMarketData ||
      filteredEventMarketData.length === 0 ||
      filteredEventMarketData.some(
        (market) => market.address === checkMarket?.address
      );

    let isInDisplayMarketData = false;
    if (checkMarket.accepted === undefined) {
      isInDisplayMarketData = displayMarketData === 'requested';
    } else if (checkMarket.accepted === true) {
      isInDisplayMarketData = displayMarketData === 'accepted';
    } else if (checkMarket.accepted === false) {
      isInDisplayMarketData = displayMarketData === 'rejected';
    }
    return isInMarketTypeDropdownFilter && isInSearch && isInDisplayMarketData;
  };

  const getPosition = (checkMarket: EventMarketData): string => {
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
        .sort((prev, cur) => cur.upVotesSum - prev.upVotesSum)
        .findIndex((market) => market.address === checkMarket.address);
    }

    return `${position + 1}`;
  };

  return {
    isVisible,
    getPosition,
    marketData,
    filteredMarketData: filteredEventMarketData,
    addMarketData,
    searchTerm,
    setSearchTerm,
  };
}
