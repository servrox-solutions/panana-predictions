import { AvailableMarket } from "@/lib/get-available-markets";
import { getMarketType } from "@/lib/get-market-type";
import { initializeMarket } from "@/lib/initialize-market";
import { Address, MarketData } from "@/lib/types/market";

export default async function Market({
  params,
}: {
  params: { address: string };
}) {
  const marketType = await getMarketType(params.address as Address);

  const availableMarket: AvailableMarket = {
    address: params.address as Address,
    type: marketType,
  };

  const marketData: MarketData = await initializeMarket(availableMarket);

  console.log("🪸", marketData);

  return (
    <div className="container mx-auto px-4 py-8">
      <pre>{JSON.stringify(marketData, null, 2)}</pre>
    </div>
  );
}
