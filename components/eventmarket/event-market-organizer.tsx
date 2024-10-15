import { AvailableMarket } from "@/lib/get-available-markets";
import { EventMarketData, EventMarketType } from "@/lib/types/market";
import { initializeEventMarket } from '@/lib/initialize-event-market';
import { EventMarketCard } from './event-market-card';

export interface MarketOrganizerProps {
  markets: AvailableMarket<EventMarketType>[];
}

export async function EventMarketOrganizer({ markets }: MarketOrganizerProps) {
  const marketData: EventMarketData[] = await Promise.all(
    markets.map((market) => initializeEventMarket(market))
  );

  return (
    <div className="flex flex-row flex-wrap content-start gap-4">
      {marketData
        .sort((prev, cur) => prev.upVotesSum - cur.upVotesSum)
        .map((market, index) => (
          <EventMarketCard
            key={`${market.creator}-${index}`}
            availableMarket={{
              address: market.address as `0x${string}`,
              type: market.category,
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
