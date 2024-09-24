import { FilterDropdown } from "@/components/filter-dropdown";
import { MarketCreateModal } from "@/components/market-create-modal";
import { MarketOrganizer } from "@/components/market-organizer";
import { MarketsSearch } from "@/components/markets-search";
import { getAvailableMarketplaces } from "@/lib/get-available-marketplaces";
import { getAvailableMarkets } from "@/lib/get-available-markets";
import { revalidatePath } from "next/cache";

// export const revalidate = 30; // in seconds
export const revalidate = false; // Infinity (default)

export default async function Markets({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const marketplaces = await getAvailableMarketplaces();
  let availableMarkets = await getAvailableMarkets(marketplaces);

  return (
    <div className="p-3 flex flex-col gap-4 pb-20">
      <div className="flex items-center justify-between">
        <MarketsSearch />

        <div className="flex space-x-2">
          <FilterDropdown
            name="markets"
            items={Array.from(
              new Set(availableMarkets.map((market) => market.type))
            )}
            preSelected={searchParams?.markets}
          />

          <MarketCreateModal
            marketplaces={marketplaces}
            onMarketCreated={async () => {
              "use server";
              await revalidatePath("/markets", "page");
            }}
          />
        </div>
      </div>
      <MarketOrganizer
        // markets={availableMarkets.filter(
        //   (market) =>
        //     !searchParams?.markets ||
        //     searchParams.markets.includes(market.type.toString())
        // )}
        markets={availableMarkets}
      />
    </div>
  );
}
