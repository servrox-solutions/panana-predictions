import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Card } from "./ui/card";
import { Web3AmountCard } from "./web3-amount-card";
import { marketTypes } from "@/lib/get-available-markets";

export interface StatisticsProps {
  placedBetsAmount: number;
  totalBettingAmount: number;
  createdMarkets: { [key in (typeof marketTypes)[number]]: number };
  totalVotes: {
    up: number;
    down: number;
  };
}

// components/Statistics.js
export default function Statistics(props: StatisticsProps) {
  const { createdMarkets, placedBetsAmount, totalBettingAmount, totalVotes } =
    props;


  return (
    <div className="grid grid-cols-2 gap-4 text-white">
      <Web3AmountCard
        className="col-span-2"
        title="Created Markets"
        assetCounts={createdMarkets}
      />

      <Card className="p-4 flex flex-col">
        <span className="text-sm text-gray-500">Created Markets</span>
        <span className="text-lg font-semibold">10</span>
      </Card>
      <Card className="p-4 flex flex-col">
        <span className="text-sm text-gray-500">Placed Bets</span>
        <span className="text-lg font-semibold">{placedBetsAmount}</span>
      </Card>
      <Card className="p-4 flex flex-col">
        <span className="text-sm text-gray-500">Volume Placed</span>
        <span className="text-lg font-semibold">
          {totalBettingAmount / 10 ** 8} APT
        </span>
      </Card>
      <Card className="p-4 flex flex-col">
        <span className="text-sm text-gray-500">Total Votes</span>
        <span className="text-lg font-semibold flex gap-4">
          <div className="flex gap-2 items-center">
            <span>{totalVotes.up}</span> <ThumbsUp className="w-4 h-4" />
          </div>
          <div className="flex gap-2 items-center">
            <span>{totalVotes.down}</span> <ThumbsDown className="h-4 w-4" />
          </div>
        </span>
      </Card>
    </div>
  );
}
