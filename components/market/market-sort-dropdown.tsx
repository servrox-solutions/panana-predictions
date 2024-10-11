"use client";

import {
  sortOptions,
  useMarketDataStore,
} from "@/lib/atoms/useMarketDataStore";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ArrowDownUp } from "lucide-react";
import { Button } from "../ui/button";
import { useEventMarketDataStore } from '@/lib/atoms/useEventMarketDataStore';

function formatSortOption(option: string) {
  return option
    .replace(/([A-Z])/g, " $1")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

export function MarketSortDropdown() {
  const { orderBy, setOrderBy } = useMarketDataStore();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1 text-sm">
          <ArrowDownUp className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only">Sort</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={orderBy}
          onValueChange={(value) =>
            setOrderBy(value as (typeof sortOptions)[number])
          }
        >
          {sortOptions.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              {formatSortOption(option)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
