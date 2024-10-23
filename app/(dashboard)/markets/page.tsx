import { MarketSwitchView } from "@/components/market/market-switch-view";
import { getAvailableMarketplaces } from "@/lib/get-available-marketplaces";
import { getAvailableMarkets } from "@/lib/get-available-markets";
import { revalidatePath } from "next/cache";
import { MarketSortDropdown } from '@/components/market/market-sort-dropdown';
import { MarketCreateModal } from '@/components/market/market-create-modal';
import { MarketOrganizer } from '@/components/market/market-organizer';
import { MarketsSearch } from '@/components/market/markets-search';
import { MarketFilterDropdown } from '@/components/market/market-filter-dropdown';
import { MarketType } from '@/lib/types/market';

export const revalidate = 30; // in seconds
// export const revalidate = false; // Infinity (default)

export default async function Markets(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const marketplaces = await getAvailableMarketplaces();
  let availableMarkets = await getAvailableMarkets<MarketType>(marketplaces);

  const uniqueAvailableMarkets = Array.from(
    new Set(availableMarkets.map((market) => market.type))
  );

  return (
    <div className="p-3 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap-reverse gap-2">
        <MarketSwitchView />

        <div className="flex justify-between sm:justify-end sm: space-x-2 grow">
          <MarketsSearch />

          <div className="flex space-x-2">
            <MarketFilterDropdown
              items={uniqueAvailableMarkets}
              preSelected={searchParams?.markets}
            />

            <MarketSortDropdown />

            <MarketCreateModal
              marketplaces={marketplaces}
              onMarketCreated={async () => {
                "use server";
                console.log("revalidating");
                revalidatePath("/markets", "page");
              }}
            />
          </div>
        </div>
      </div>
      <MarketOrganizer markets={availableMarkets} />
    </div>
  );
}
