"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ListFilter } from "lucide-react";
import { Button } from "./ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Web3Icon } from "./web3-icon";
import { SupportedAsset } from "@/lib/types/market";

interface FilterDropdownProps {
  items: string[];
  preSelected?: string | string[];
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  items,
  preSelected,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedFilters, setSelectedFilters] = useState<string[]>(
    preSelected
      ? Array.isArray(preSelected)
        ? preSelected
        : [preSelected]
      : []
  );

  // Initialize filters from search params on page load
  useEffect(() => {
    const filtersFromParams = searchParams.getAll("filter");
    setSelectedFilters(filtersFromParams);
  }, [searchParams]);

  // Toggle filter selection and update query params
  const handleFilterChange = (filter: string) => {
    const updatedFilters = selectedFilters.includes(filter)
      ? selectedFilters.filter((item) => item !== filter)
      : [...selectedFilters, filter];

    setSelectedFilters(updatedFilters);

    const params = new URLSearchParams(searchParams.toString());

    // Update the search params based on the filter selection
    if (updatedFilters.length > 0) {
      params.delete("filter"); // Clear existing filters
      updatedFilters.forEach((filter) => params.append("filter", filter)); // Add selected filters
    } else {
      params.delete("filter"); // No filters selected, remove the parameter
    }

    // Push the new URL with updated query params without reloading
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1 text-sm">
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
          >
            <Web3Icon
              asset={item as SupportedAsset}
              className="scale-100 mr-2"
            />
            {item}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
