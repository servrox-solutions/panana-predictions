import { atom, useAtom } from "jotai";
import { MarketData } from "@/lib/types/market";

export const sortOptions = ["newest", "oldest", "mostVolume", "upvotes", "downvotes"] as const;

export const marketDataAtom = atom<MarketData[]>([]);
export const searchTermAtom = atom<string>("");
export const displayMarketDataAtom = atom<"open" | "closed">("open");
export const orderByAtom = atom<(typeof sortOptions)[number]>("newest");

export function useMarketDataStore() {
  const [marketData, setMarketData] = useAtom(marketDataAtom);
  const [searchTerm, setSearchTerm] = useAtom(searchTermAtom);
  const [displayMarketData, setDisplayMarketData] = useAtom(
    displayMarketDataAtom
  );
  const [orderBy, setOrderBy] = useAtom(orderByAtom);

  return {
    marketData,
    setMarketData,
    searchTerm,
    setSearchTerm,
    displayMarketData,
    setDisplayMarketData,
    orderBy,
    setOrderBy,
  };
}
