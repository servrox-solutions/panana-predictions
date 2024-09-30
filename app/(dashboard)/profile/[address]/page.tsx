
import { ModeToggle } from "@/components/mode-toggle";
import ProfileCard from "@/components/profile-card";
import Statistics from "@/components/profile-statistics";
import { Card } from "@/components/ui/card";
import { WalletReconnect } from "@/components/wallet-reconnect";
import { MODULE_ADDRESS_FROM_ABI } from "@/lib/aptos";
import { getAccountBalance } from "@/lib/get-account-balance";
import {
  getTotalTransactionCount,
} from "@/lib/get-account-transactions";
import { NoditClient } from '@/lib/nodit/client';
import { MarketType, marketTypes } from "@/lib/types/market";
import { Address } from "@/lib/types/market";

export default async function Profile({
  params,
}: {
  params: { address: Address };
}) {
  const noditClient = new NoditClient(MODULE_ADDRESS_FROM_ABI, process.env.NODIT_API_KEY as Address);

  const [balance, totalTransactions, statisticsPageData] = await Promise.all([
    getAccountBalance(params.address),
    getTotalTransactionCount(params.address),
    noditClient.fetchProfileStatisticsData(params.address)
  ]);

  const totalInteractions = statisticsPageData.data.market_interactions.aggregate.count;

  const placedBetsSum = statisticsPageData.data.placed_bets.aggregate.sum.amount;
  const totalVotes = statisticsPageData.data.total_votes.aggregate.count;

  const bettedMarketDetails: { [key in MarketType]: number } = {
    BTC: statisticsPageData.data.btc_placed.length,
    APT: statisticsPageData.data.apt_placed.length,
    SOL: statisticsPageData.data.sol_placed.length,
    USDC: statisticsPageData.data.usdc_placed.length,
    ETH: statisticsPageData.data.eth_placed.length,
  };

  const createdMarketDetails: { [key in MarketType]: number } = {
    BTC: statisticsPageData.data.btc.length,
    APT: statisticsPageData.data.apt.length,
    SOL: statisticsPageData.data.sol.length,
    USDC: statisticsPageData.data.usdc.length,
    ETH: statisticsPageData.data.eth.length,
  };

  return (
    <div className="flex justify-center items-center h-full">
      <div className="max-w-[1200px] grid grid-cols-1 flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <ProfileCard
            className="col-span-1"
            address={params.address as Address}
            balance={balance / 10 ** 8}
            totalTransactions={totalTransactions}
          />
          <Card className="p-4 flex flex-col gap-2">
            <span className="text-sm text-gray-500">Settings</span>
            <div className="mt-2 flex gap-2 items-center">
              <ModeToggle className="w-[60px]" />{" "}
              <span className="col-span-4">Light/Dark Mode</span>
            </div>
            <div className="flex gap-2 items-center">
              <WalletReconnect className="w-[60px] flex justify-center gap-0" />{" "}
              <span className="col-span-4">
                Reconnect wallet on page reload
              </span>
            </div>
          </Card>
        </div>

        <Statistics
          createdMarkets={createdMarketDetails}
          bettedMarkets={bettedMarketDetails}
          totalInteractions={totalInteractions}
          placedBetsSum={placedBetsSum}
          totalVotes={totalVotes}
        />
      </div>
    </div>
  );
}
