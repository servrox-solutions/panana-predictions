import { AvailableMarket } from "@/lib/get-available-markets";
import { initializeMarket } from "@/lib/initialize-market";
import { MarketCard } from "./market-card";
import { MarketData } from "@/lib/types/market";

export interface MarketOrganizerProps {
  markets: AvailableMarket[];
}

export async function MarketOrganizer({ markets }: MarketOrganizerProps) {
  const marketData: MarketData[] = await Promise.all(
    markets.map((market) => initializeMarket(market))
  );
  console.log("marketData 💯", marketData);

  return (
    <div className="flex flex-row flex-wrap content-start gap-4">
      {marketData
        .sort((prev, cur) => prev.endTime - cur.endTime)
        .map((market, index) => (
          <MarketCard
            key={`${market.creator}-${index}`}
            availableMarket={{
              address: market.address,
              type: market.tradingPair.one,
            }}
            initialMarketData={market}
          />
        ))}

      {/* {markets.map((market, index) => (
        <MarketCard
          key={`${market.address}-${index}`}
          availableMarket={market}
        />
      ))} */}
    </div>
  );
}
