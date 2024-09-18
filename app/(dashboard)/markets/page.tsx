import { MarketCreateModal } from '@/components/market-create-modal';
import { MarketOrganizer } from "@/components/market-organizer";
import { getAvailableMarketplaces } from "@/lib/get-available-marketplaces";
import { getAvailableMarkets } from "@/lib/get-available-markets";

export const revalidate = false;

export default async function Markets() {
  const marketplaces = await getAvailableMarketplaces();
  console.log("💯 marketplaces", marketplaces);

  const availableMarkets = await getAvailableMarkets(marketplaces);
  console.log("💯 availableMarkets", availableMarkets);

  return (
    <div className="h-full p-3">
      {/* marketplaces={{ "APT/USD": "0xabc", "BTC/USD": "0xabc" }} */}
      <MarketCreateModal />
      <MarketOrganizer markets={availableMarkets} />
    </div>
  );
}
