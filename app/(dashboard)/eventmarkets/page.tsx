import { EventMarketCreateModal } from '@/components/event-market-create-modal';
import { EventMarketOrganizer } from '@/components/event-market-organizer';
import { FilterDropdown } from "@/components/filter-dropdown";
import { MarketsSearch } from "@/components/markets-search";
import { SortDropdown } from "@/components/sort-dropdown";
import { SwitchEventMarketView } from '@/components/switch-event-market-view';
import { getAvailableMarketplaces } from "@/lib/get-available-marketplaces";
import { getAvailableMarkets } from "@/lib/get-available-markets";
import { revalidatePath } from "next/cache";

export const revalidate = 30; // in seconds
// export const revalidate = false; // Infinity (default)

export default async function Markets({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const marketplaces = await getAvailableMarketplaces('event_category');
  let availableMarkets = await getAvailableMarkets(marketplaces);

  const uniqueAvailableMarkets = Array.from(
    new Set(availableMarkets.map((market) => market.type))
  );

  return (
    <div className="p-3 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap-reverse gap-2">
        <SwitchEventMarketView />

        <div className="flex justify-between sm:justify-end sm: space-x-2 grow">
          <MarketsSearch />

          <div className="flex space-x-2">
            <FilterDropdown
              name="markets"
              items={uniqueAvailableMarkets}
              preSelected={searchParams?.markets}
            />

            <SortDropdown />

            <EventMarketCreateModal
              marketplaces={marketplaces}
              onMarketCreated={async () => {
                "use server";
                revalidatePath("/markets", "page");
              }}
            />
          </div>
        </div>
      </div>
      <EventMarketOrganizer markets={availableMarkets} />
    </div>
  );
}
