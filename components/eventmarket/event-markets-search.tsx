"use client";

import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { useCallback } from "react";
import { useEventMarketDataStore } from '@/lib/atoms/useEventMarketDataStore';

export function EventMarketsSearch({ className }: { className?: string }) {
  const { searchTerm, setSearchTerm } = useEventMarketDataStore();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [setSearchTerm]
  );

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
        onChange={handleChange}
      />
    </div>
  );
}
