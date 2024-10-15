import { AvailableMarket } from "@/lib/get-available-markets";
import { initializeMarket } from "@/lib/initialize-market";
import { MarketCard } from "./market-card";
import { MarketData, MarketType } from "@/lib/types/market";

export interface MarketOrganizerProps {
  markets: AvailableMarket<MarketType>[];
}

export async function MarketOrganizer({ markets }: MarketOrganizerProps) {
  const marketData: MarketData[] = await Promise.all(
    markets.map((market) => initializeMarket(market))
  );

  return (
    <div className="flex flex-row flex-wrap content-start gap-4">
      {marketData
        .sort((prev, cur) => cur.createdAt - prev.createdAt)
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

      {markets.length === 0 && (
        <div className="text-center text-muted-foreground w-full">
          No markets found. Go create one!
        </div>
      )}
    </div>
  );
}
