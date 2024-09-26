"use client";

import { useMarket } from "@/lib/hooks/useMarket";
import { AvailableMarket } from "@/lib/get-available-markets";
import { MarketCardSimpleUi } from "./market-card-simple-ui";
import { MarketData } from "@/lib/types/market";
import { usePlaceBet } from "@/lib/hooks/usePlaceBet";
import { useSubmitVote } from "@/lib/hooks/useSubmitVote";
import { useFilterStore } from "@/lib/atoms/useFilterStore";
import { useMarketData } from "@/lib/hooks/useMarketData";
import { useMarketDataStore } from "@/lib/atoms/useMarketDataStore";
import { cn } from "@/lib/utils";
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { toast } from 'react-toastify';

interface MarketCardProps {
  availableMarket: AvailableMarket;
  initialMarketData?: MarketData;
}

export const MarketCard: React.FC<MarketCardProps> = ({
  availableMarket,
  initialMarketData,
}) => {
  const { marketData: marketDataStore } = useMarketDataStore();
  const { filteredMarketData } = useMarketData();
  const { marketData } = useMarket(
    availableMarket,
    3000,
    initialMarketData ??
    marketDataStore?.find(
      (market) => market.address === availableMarket.address
    ) ??
    filteredMarketData.find(
      (market) => market.address === availableMarket.address
    )
  );
  const { account } = useWallet();
  const { placeBet } = usePlaceBet();
  const { submitVote } = useSubmitVote();
  const { filter } = useFilterStore("markets");

  const onPlaceBet = async (betUp: boolean, amount: number) => {
    if (!account?.address) {
      toast.info('Please connect your wallet first.');
      return;
    }
    if (marketData) {
      await placeBet(marketData, betUp, amount);
    }
  };

  const onVote = async (isVoteUp: boolean) => {
    if (!account?.address) {
      toast.info('Please connect your wallet first.');
      return;
    }
    if (marketData) {
      await submitVote(marketData, isVoteUp);
    }
  };

  const isInFilter =
    !marketData?.tradingPair.one ||
    !filter ||
    filter.length === 0 ||
    filter.includes(marketData.tradingPair.one);

  const isInSearch =
    !filteredMarketData ||
    filteredMarketData.length === 0 ||
    filteredMarketData.some((market) => market.address === marketData?.address);

  const shouldShow = isInFilter && isInSearch;

  return (
    <div className={cn("max-w-full", !shouldShow && "hidden")}>
      <MarketCardSimpleUi
        address={marketData?.address ?? "1337"}
        minBet={marketData?.minBet ?? 1337}
        betCloseTime={marketData?.startTime ?? 1336}
        resolveTime={marketData?.endTime ?? 1337}
        tradingPair={marketData?.tradingPair ?? { one: "APT", two: "USD" }}
        upVotesSum={marketData?.upVotesSum ?? 1337}
        downVotesSum={marketData?.downVotesSum ?? 1337}
        upWinFactor={marketData?.upWinFactor ?? 1337}
        downWinFactor={marketData?.downWinFactor ?? 1337}
        upBetsSum={marketData?.upBetsSum ?? 1337}
        downBetsSum={marketData?.downBetsSum ?? 1337}
        upBetsCount={marketData?.upBets.size ?? 1337}
        downBetsCount={marketData?.downBets.size ?? 1337}
        onPlaceBet={onPlaceBet}
        onVote={onVote}
      />
    </div>
  );
};
