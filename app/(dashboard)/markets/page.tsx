import { MarketCreateModal } from "@/components/market-create-modal";
import { MarketOrganizer } from "@/components/market-organizer";
import { getAvailableMarketplaces } from "@/lib/get-available-marketplaces";
import { getAvailableMarkets } from "@/lib/get-available-markets";

// export const revalidate = 30; // in seconds
export const revalidate = false; // Infinity (default)

export default async function Markets() {
  const marketplaces = await getAvailableMarketplaces();
  console.log("💯 marketplaces", marketplaces);

  const availableMarkets = await getAvailableMarkets(marketplaces);
  console.log("💯 availableMarkets", availableMarkets);

  return (
    <div className="h-full p-3 flex flex-col gap-4 bg-[url('/character.png')] bg-[length:600px_700px] bg-no-repeat bg-fixed bg-center min-h-screen">
      {/* marketplaces={{ "APT/USD": "0xabc", "BTC/USD": "0xabc" }} */}
      <div className="flex w-full items-end">
        <MarketCreateModal />
      </div>
      <MarketOrganizer markets={availableMarkets} />
    </div>
  );
}
