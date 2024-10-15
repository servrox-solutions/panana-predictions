import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Card } from "../ui/card";
import { Web3AmountCard } from "../web3-amount-card";
import { MarketType } from "@/lib/types/market";
import { octasToApt } from '@/lib/aptos';

export interface StatisticsProps {
  placedBetsSum: number;
  totalInteractionsAssetMarkets: number;
  totalInteractionsEventMarkets: number;
  createdMarkets: { [key in MarketType]: number };
  bettedMarkets: { [key in MarketType]: number };
  totalVotes: number;
}

// components/Statistics.js
export default function Statistics(props: StatisticsProps) {
  const {
    totalVotes,
    totalInteractionsAssetMarkets,
    totalInteractionsEventMarkets,
    bettedMarkets,
    placedBetsSum,
    createdMarkets
  } = props;
  return (
    <div className="grid grid-cols-2 gap-4 text-muted dark:text-white">
      <Web3AmountCard
        className="col-span-2"
        title="Betted Markets"
        assetCounts={bettedMarkets}
      />
      <Card className="p-4 flex flex-col">
        <span className="text-sm text-gray-500">Volume Placed</span>
        <span className="text-lg font-semibold">
          {octasToApt(placedBetsSum).toLocaleString(undefined, { maximumFractionDigits: 2 })} APT
        </span>
      </Card>
      <Card className="p-4 flex flex-col">
        <span className="text-sm text-gray-500">Total Votes</span>
        <span className="text-lg font-semibold flex gap-4">
          <div className="flex gap-2 items-center">
            <span>{totalVotes.toLocaleString()}</span>{" "}
            <ThumbsUp className="w-4 h-4" /><ThumbsDown className="h-4 w-4" />
          </div>
        </span>
      </Card>

      <Web3AmountCard
        className="col-span-2"
        title="Created Markets"
        assetCounts={createdMarkets}
      />

      <Card className="p-4 flex flex-col">
        <span className="text-sm text-gray-500">Interactions with Asset Markets</span>
        <span className="text-lg font-semibold">
          {totalInteractionsAssetMarkets.toLocaleString()}
        </span>
      </Card>

      <Card className="p-4 flex flex-col">
        <span className="text-sm text-gray-500">Interactions with Event Markets</span>
        <span className="text-lg font-semibold">
          {totalInteractionsEventMarkets.toLocaleString()}
        </span>
      </Card>

    </div>
  );
}
