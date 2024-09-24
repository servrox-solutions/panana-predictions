"use client";

import { useMarketDataStore } from "@/lib/atoms/useMarketDataStore";
import { Input } from "./ui/input";

export function MarketsSearch() {
  const { searchTerm, setSearchTerm } = useMarketDataStore();

  return (
    <div>
      <Input
        type="search"
        placeholder="Search markets..."
        className="h-8 w-[150px] lg:w-[250px] backdrop-grayscale-[.5] bg-gray-800 bg-opacity-30 backdrop-blur-lg text-white"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}
