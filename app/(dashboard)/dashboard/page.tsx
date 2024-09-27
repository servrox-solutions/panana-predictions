import { getMarketCreatedEvents } from "@/lib/get-market-created-events";
import { getMarketResolvedEvents } from "@/lib/get-market-resolved-events";
import { fetchPriceUSD } from "@/lib/fetch-price";
import { MODULE_ADDRESS_FROM_ABI } from "@/lib/aptos";
import { getAvailableMarketplaces } from "@/lib/get-available-marketplaces";
import { getMarketplaceRessource } from "@/lib/get-marketplace-ressource";
import { DashboardContent } from "@/components/dashboard-content";
import { MarketType } from "@/lib/types/market";

export interface MarketResolvedEventData {
  market: {
    inner: string;
  };
  dissolved: boolean;
  market_cap: string;
  marketplace: {
    inner: string;
  };
  end_time_timestamp: string;
  start_time_timestamp: string;
}

// revalidate page cache every X seconds
export const revalidate = 120;

export default async function Dashboard({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const marketplaces = await getAvailableMarketplaces();
  const symbols = marketplaces.map((marketplace) => {
    const parts = marketplace.typeArgument.split("::");
    return parts[parts.length - 1];
  }, {}) as MarketType[];

  // TODO: fetch data parallel
  const createdEvents = await Promise.all(
    marketplaces.map((marketplace) =>
      getMarketCreatedEvents(
        MODULE_ADDRESS_FROM_ABI,
        marketplace.typeArgument,
        25
      )
    )
  );
  const resolvedEvents = await Promise.all(
    marketplaces.map((marketplace) =>
      getMarketResolvedEvents(
        MODULE_ADDRESS_FROM_ABI,
        marketplace.typeArgument,
        25
      )
    )
  );
  const price = await fetchPriceUSD("aptos");
  const allMarketplaces = await Promise.all(
    marketplaces.map((marketplace) =>
      getMarketplaceRessource({
        address: marketplace.address,
        type: marketplace.typeArgument,
      })
    )
  );

  const totalVolumeApt = allMarketplaces
    .map((marketplace) => +marketplace.all_time_volume)
    .reduce((prev, cur) => prev + cur, 0);
  const totalVolume = {
    apt: totalVolumeApt / 10 ** 8,
    usd: (totalVolumeApt / 10 ** 8) * price,
  };

  const resolvedMarkets = resolvedEvents
    .map((marketplaceEvents, idx) =>
      marketplaceEvents.map((x) => ({
        endTimeTimestamp: +x.end_time_timestamp,
        assetSymbol: symbols[idx],
        startTimeTimestamp: +x.start_time_timestamp,
        marketAddress: x.market.inner,
        marketplaceAddress: x.marketplace.inner,
        creator: x.creator,
        startPrice: x.start_price,
        endPrice: x.end_price,
        marketCap: {
          asset: +x.market_cap / 10 ** 8,
          usd: (+x.market_cap / 10 ** 8) * price,
        },
        dissolved: x.dissolved,
      }))
    )
    .flat()
    .sort((x, y) => y.endTimeTimestamp - x.endTimeTimestamp);

  const createdMarkets = createdEvents
    .map((marketplaceEvents, idx) =>
      marketplaceEvents.map((x) => ({
        creator: x.creator,
        assetSymbol: symbols[idx],
        createdAtTimestamp: +x.created_at_timestamp,
        endTimeTimestamp: +x.end_time_timestamp,
        startTimeTimestamp: +x.start_time_timestamp,
        marketAddress: x.market.inner,
        marketplaceAddress: x.marketplace.inner,
        minBet: +x.min_bet,
      }))
    )
    .flat()
    .filter(
      (createdMarket) =>
        !resolvedMarkets.some(
          (resolvedMarket) =>
            resolvedMarket.marketAddress === createdMarket.marketAddress
        )
    )
    .sort((x, y) => y.createdAtTimestamp - x.createdAtTimestamp);

  const openMarkets = allMarketplaces.reduce(
    (prev, cur, idx) => ({
      ...prev,
      [symbols[idx]]: cur.available_markets.length,
    }),
    {}
  ) as { [key in MarketType]: number };

  return (
    <>
      <DashboardContent
        totalVolume={totalVolume}
        latestCreatedMarkets={createdMarkets}
        latestResolvedMarkets={resolvedMarkets}
        searchParams={searchParams}
        openMarkets={openMarkets}
      />
    </>
  );
}
