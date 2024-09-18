import { MarketOrganizer } from "@/components/market-organizer";
import { getAvailableMarketplaces } from "@/lib/get-available-marketplaces";
import { getAvailableMarkets } from "@/lib/get-available-markets";

export const revalidate = false;

export default async function Markets() {
  const marketplaceAddresses = await getAvailableMarketplaces();
  console.log("💯 marketplaceAddresses", marketplaceAddresses);
  const availableMarkets = await getAvailableMarkets(marketplaceAddresses);
  console.log("💯 availableMarkets", availableMarkets);

  return (
    <div className="h-full p-3">
      <MarketOrganizer markets={availableMarkets} />
    </div>
  );
}
