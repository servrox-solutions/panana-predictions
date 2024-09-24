import { FilterDropdown } from "@/components/filter-dropdown";
import { MarketCreateModal } from "@/components/market-create-modal";
import { MarketOrganizer } from "@/components/market-organizer";
import { getAvailableMarketplaces } from "@/lib/get-available-marketplaces";
import { getAvailableMarkets } from "@/lib/get-available-markets";

// export const revalidate = 30; // in seconds
export const revalidate = false; // Infinity (default)

export default async function Markets({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const marketplaces = await getAvailableMarketplaces();

  const availableMarkets = await getAvailableMarkets(marketplaces);

  return (
    <div className="p-3 flex flex-col gap-4 pb-20">
      <div className="ml-auto flex items-center gap-2">
        <FilterDropdown
          name="markets"
          items={Array.from(
            new Set(availableMarkets.map((market) => market.type))
          )}
          preSelected={searchParams?.markets}
        />
      </div>
      <div className="flex w-full items-end">
        <MarketCreateModal marketplaces={marketplaces} />
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
