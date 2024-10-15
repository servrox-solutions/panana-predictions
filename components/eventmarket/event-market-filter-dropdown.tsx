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
import { useFilterStore } from "@/lib/atoms/useFilterStore";
import { EventMarketType, MarketType } from "@/lib/types/market";
import { EventIcon } from '../event-icon';

interface EventMarketFilterDropdownProps {
  items: EventMarketType[];
  preSelected?: EventMarketType | EventMarketType[];
  onFilterChange?: (filter: EventMarketType[]) => void;
}

export const EventMarketFilterDropdown: React.FC<EventMarketFilterDropdownProps> = ({
  items,
  preSelected,
  onFilterChange,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setFilter } = useFilterStore('eventmarkets');

  const [selectedFilters, setSelectedFilters] = useState<EventMarketType[]>(
    Array.isArray(preSelected) ? preSelected : preSelected ? [preSelected] : []
  );

  useEffect(() => {
    const filtersFromParams = searchParams.get('eventmarkets');
    if (filtersFromParams) {
      setSelectedFilters(filtersFromParams.split(",") as EventMarketType[]);
    }
  }, [searchParams]);

  const handleFilterChange = (filter: EventMarketType) => {
    const updatedFilters = selectedFilters.includes(filter)
      ? selectedFilters.filter((item) => item !== filter) // Remove the filter if it's already selected
      : [...selectedFilters, filter]; // Add filter if not selected

    setSelectedFilters(updatedFilters);

    // Create new URLSearchParams and update the 'filter' query param
    const params = new URLSearchParams(searchParams.toString());

    if (updatedFilters.length > 0) {
      params.set('eventmarkets', updatedFilters.join(",")); // Set filters as a comma-separated string
    } else {
      params.delete('eventmarkets'); // Remove 'filter' param if no filters selected
    }

    // Push updated URL with shallow routing to prevent full page reload
    router.push(`${pathname}?${params.toString()}`, { scroll: false });

    setFilter(updatedFilters);

    onFilterChange?.(updatedFilters);
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
            <EventIcon event={item} className="scale-100 mr-2" />
            {item}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
