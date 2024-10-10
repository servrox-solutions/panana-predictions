import { atom, useAtom } from "jotai";
import { EventMarketData } from "@/lib/types/market";

export const sortOptions = ["newest", "oldest", "mostVolume", "upvotes", "downvotes"] as const;

export const eventMarketDataAtom = atom<EventMarketData[]>([]);
export const searchTermAtom = atom<string>("");
export const displayMarketDataAtom = atom<"accepted" | "requested" | "rejected">("accepted");
export const orderByAtom = atom<(typeof sortOptions)[number]>("newest");

export function useEventMarketDataStore() {
  const [marketData, setMarketData] = useAtom(eventMarketDataAtom);
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
