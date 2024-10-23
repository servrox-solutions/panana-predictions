
import { EventMarketSwitchView } from '@/components/eventmarket/event-market-switch-view';
import { getAvailableMarketplaces } from "@/lib/get-available-marketplaces";
import { getAvailableMarkets } from "@/lib/get-available-markets";
import { revalidatePath } from "next/cache";
import { EventMarketSortDropdown } from '@/components/eventmarket/event-market-sort-dropdown';
import { EventMarketCreateModal } from '@/components/eventmarket/event-market-create-modal';
import { EventMarketOrganizer } from '@/components/eventmarket/event-market-organizer';
import { EventMarketsSearch } from '@/components/eventmarket/event-markets-search';
import { EventMarketFilterDropdown } from '@/components/eventmarket/event-market-filter-dropdown';
import { EventMarketType } from '@/lib/types/market';

export const revalidate = 30; // in seconds
// export const revalidate = false; // Infinity (default)

export default async function Markets(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const marketplaces = await getAvailableMarketplaces('event_category');
  let availableMarkets = await getAvailableMarkets<EventMarketType>(marketplaces);

  const uniqueAvailableMarkets = Array.from(
    new Set(availableMarkets.map((market) => market.type))
  );

  return (
    <div className="p-3 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap-reverse gap-2">
        <EventMarketSwitchView />

        <div className="flex justify-between sm:justify-end sm: space-x-2 grow">
          <EventMarketsSearch />

          <div className="flex space-x-2">
            <EventMarketFilterDropdown
              items={uniqueAvailableMarkets}
              preSelected={searchParams?.markets as EventMarketType[]}
            />

            <EventMarketSortDropdown />

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
