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
  console.log("💯 marketplaces", marketplaces);

  const availableMarkets = await getAvailableMarkets(marketplaces);
  console.log("💯 availableMarkets", availableMarkets);

  console.log("💯 searchParams", searchParams);

  return (
    <div className="p-3 flex flex-col gap-4 pb-20">
      <div className="ml-auto flex items-center gap-2">
        <FilterDropdown
          items={Array.from(
            new Set(availableMarkets.map((market) => market.type))
          )}
          preSelected={searchParams?.filter}
        />
      </div>
      {/* marketplaces={{ "APT/USD": "0xabc", "BTC/USD": "0xabc" }} */}
      <div className="flex w-full items-end">
        <MarketCreateModal marketplaces={marketplaces} />
      </div>
      <MarketOrganizer markets={availableMarkets} />
    </div>
  );
}
