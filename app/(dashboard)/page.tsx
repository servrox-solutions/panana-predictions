import { DashboardContent } from "@/components/dashboard-content";
import { ToastContainer } from "react-toastify";
import { getMarketCreatedEvents } from '@/lib/get-market-created-events';
import { getMarketResolvedEvents } from '@/lib/get-market-resolved-events';
import { fetchPriceUSD } from '@/lib/fetch-price';
import { MODULE_ADDRESS_FROM_ABI } from '@/lib/aptos';



export interface MarketResolvedEventData {
  market: {
    inner: string;
  }
  dissolved: boolean;
  market_cap: string;
  marketplace: {
    inner: string;
  }
  end_time_timestamp: string;
  start_time_timestamp: string;
}

// revalidate page cache every X seconds
export const revalidate = 120;

export default async function Dashboard() {
  const items = [
    getMarketCreatedEvents(
      MODULE_ADDRESS_FROM_ABI,
      `${MODULE_ADDRESS_FROM_ABI}::switchboard_asset::APT`
    ),
    // getMarketResolvedEvents(
    //   `MODULE_ADDRESS_FROM_ABI`,
    //   `${MODULE_ADDRESS_FROM_ABI}::switchboard_asset::APT`
    // ),
    getMarketResolvedEvents(
      '0xa007e13d9a6ac196cacf33e077f1682fa49649f1aa3b129afa9fab1ea93501b',
      '0xa007e13d9a6ac196cacf33e077f1682fa49649f1aa3b129afa9fab1ea93501b::switchboard_asset::APT'
    ),
    fetchPriceUSD('aptos'),
  ] as const;

  const [createdEvents, resolvedEvents, price] = await Promise.all(items);


  const createdMarkets = createdEvents.map(x => ({
    creator: x.creator,
    createdAtTimestamp: +x.created_at_timestamp,
    endTimeTimestamp: +x.end_time_timestamp,
    startTimeTimestamp: +x.start_time_timestamp,
    marketAddress: x.market.inner,
    marketplaceAddress: x.marketplace.inner,
    minBet: +x.min_bet,
  }));

  const resolvedMarkets = resolvedEvents.map(x => ({
    endTimeTimestamp: +x.end_time_timestamp,
    startTimeTimestamp: +x.start_time_timestamp,
    marketAddress: x.market.inner,
    marketplaceAddress: x.marketplace.inner,
    creator: x.creator,
    marketCap: {
      asset: +x.market_cap / 10 ** 8,
      usd: (+x.market_cap / 10 ** 8) * price,
    },
    dissolved: x.dissolved,
  }));

  return (
    <>
      <DashboardContent latestCreatedMarkets={createdMarkets} latestResolvedMarkets={resolvedMarkets} />
      <ToastContainer />
    </>
  );
}