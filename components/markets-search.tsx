"use client";

import { useMarketDataStore } from "@/lib/atoms/useMarketDataStore";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

export function MarketsSearch({ className }: { className?: string }) {
  const { searchTerm, setSearchTerm } = useMarketDataStore();

  return (
    <div>
      <Input
        type="search"
        placeholder="Search markets..."
        className={cn(
          "h-8 w-[150px] lg:w-[250px] backdrop-grayscale-[.5] bg-gray-200 dark:bg-transparent bg-opacity-30 backdrop-blur-lg",
          className
        )}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}
