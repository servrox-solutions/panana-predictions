import { atom, useAtom } from "jotai";
import { MarketData } from "@/lib/types/market";

export const marketDataAtom = atom<MarketData[]>([]);
export const searchTermAtom = atom<string>("");
export const displayMarketDataAtom = atom<"open" | "closed">("open");

export function useMarketDataStore() {
  const [marketData, setMarketData] = useAtom(marketDataAtom);
  const [searchTerm, setSearchTerm] = useAtom(searchTermAtom);
  const [displayMarketData, setDisplayMarketData] = useAtom(
    displayMarketDataAtom
  );

  return {
    marketData,
    setMarketData,
    searchTerm,
    setSearchTerm,
    displayMarketData,
    setDisplayMarketData,
  };
}
