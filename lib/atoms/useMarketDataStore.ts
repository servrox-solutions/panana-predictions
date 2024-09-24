import { atom, useAtom } from "jotai";
import { MarketData } from "@/lib/types/market";

export const marketDataAtom = atom<MarketData[]>([]);
export const searchTermAtom = atom<string>("");

export function useMarketDataStore() {
  const [marketData, setMarketData] = useAtom(marketDataAtom);
  const [searchTerm, setSearchTerm] = useAtom(searchTermAtom);

  return { marketData, setMarketData, searchTerm, setSearchTerm };
}
