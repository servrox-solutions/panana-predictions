// import { MarketCard } from "./market-card";
import { AvailableMarket } from "@/lib/get-available-markets";
import { getMarketObjects } from "@/lib/get-market-objects";
import { MarketCardSimpleUi } from "./market-card-simple-ui";

export interface MarketOrganizerProps {
  markets: AvailableMarket[];
}

export async function MarketOrganizer({ markets }: MarketOrganizerProps) {
  const marketObjects = await getMarketObjects(markets);
  console.log("marketObjects 💯", marketObjects);
  // const objs = [...marketObjects, ...marketObjects, ...marketObjects, ...marketObjects, ...marketObjects, ...marketObjects, ...marketObjects, ...marketObjects, ...marketObjects, ...marketObjects, ...marketObjects, ...marketObjects, ...marketObjects, ...marketObjects, ...marketObjects, ...marketObjects];
  return (
    <div className="flex flex-row flex-wrap content-start gap-4">

      {marketObjects.sort((prev, cur) => prev.endTime - cur.endTime).map((marketObject, index) => (
        <MarketCardSimpleUi
          key={`${marketObject.creator}-${index}`}
          tradingPair={marketObject.tradingPair}
          minBet={marketObject.minBet}
          betCloseTime={marketObject.startTime}
          resolveTime={marketObject.endTime}
          pool={marketObject.pool}
          market={marketObject.address}
        />
      ))}
    </div>
  );
}
