"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ListFilter } from "lucide-react";
import { Button } from "../ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Web3Icon } from "../web3-icon";
import { useFilterStore } from "@/lib/atoms/useFilterStore";
import { MarketType } from "@/lib/types/market";

interface MarketFilterDropdownProps {
  name?: string;
  items: MarketType[];
  preSelected?: string | string[];
  onFilterChange?: (filter: MarketType[]) => void;
}

export const MarketFilterDropdown: React.FC<MarketFilterDropdownProps> = ({
  name = 'markets',
  items,
  preSelected,
  onFilterChange,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setFilter } = useFilterStore(name);

  const [selectedFilters, setSelectedFilters] = useState<string[]>(
    Array.isArray(preSelected) ? preSelected : preSelected ? [preSelected] : []
  );

  useEffect(() => {
    const filtersFromParams = searchParams.get(name);
    if (filtersFromParams) {
      setSelectedFilters(filtersFromParams.split(","));
    }
  }, [searchParams]);

  const handleFilterChange = (filter: string) => {
    const updatedFilters = selectedFilters.includes(filter)
      ? selectedFilters.filter((item) => item !== filter) // Remove the filter if it's already selected
      : [...selectedFilters, filter]; // Add filter if not selected

    setSelectedFilters(updatedFilters);

    // Create new URLSearchParams and update the 'filter' query param
    const params = new URLSearchParams(searchParams.toString());

    if (updatedFilters.length > 0) {
      params.set(name, updatedFilters.join(",")); // Set filters as a comma-separated string
    } else {
      params.delete(name); // Remove 'filter' param if no filters selected
    }

    // Push updated URL with shallow routing to prevent full page reload
    router.push(`${pathname}?${params.toString()}`, { scroll: false });

    setFilter(updatedFilters);

    onFilterChange?.(updatedFilters as MarketType[]);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 text-sm"
          disabled={items.length === 0}
        >
          <ListFilter className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only">Filter</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => (
          <DropdownMenuCheckboxItem
            key={item}
            checked={selectedFilters.includes(item)}
            onCheckedChange={() => handleFilterChange(item)}
            onSelect={(event) => event.preventDefault()}
          >
            <Web3Icon asset={item} className="scale-100 mr-2" />
            {item}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
