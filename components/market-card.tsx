"use client";

import { useMarket } from "@/lib/hooks/useMarket";
import { AvailableMarket } from "@/lib/get-available-markets";
import { MarketCardSimpleUi } from "./market-card-simple-ui";
import { MarketData } from "@/lib/types/market";
import { usePlaceBet } from "@/lib/hooks/usePlaceBet";
import { useSubmitVote } from "@/lib/hooks/useSubmitVote";
import { useMarketData } from "@/lib/hooks/useMarketData";
import { useMarketDataStore } from "@/lib/atoms/useMarketDataStore";
import { cn } from "@/lib/utils";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from "react-toastify";
import { useMemo, useCallback, memo } from "react";

interface MarketCardProps {
  availableMarket: AvailableMarket;
  initialMarketData?: MarketData;
}

const MarketCardSimpleUiMemo = memo(MarketCardSimpleUi);

export const MarketCard: React.FC<MarketCardProps> = ({
  availableMarket,
  initialMarketData,
}) => {
  const { marketData: marketDataStore } = useMarketDataStore();
  const { filteredMarketData, isVisible, getPosition } = useMarketData();
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

  const onPlaceBet = useCallback(
    async (betUp: boolean, amount: number) => {
      if (!account?.address) {
        toast.info("Please connect your wallet first.");
        return;
      }
      if (marketData) {
        const isSuccess = await placeBet(marketData, betUp, amount);
        if (isSuccess) toast.success("Bet placed successfully.");
      }
    },
    [account?.address, marketData, placeBet]
  );

  const onVote = useCallback(
    async (isVoteUp: boolean) => {
      if (!account?.address) {
        toast.info("Please connect your wallet first.", { autoClose: 2000 });
        return;
      }
      if (marketData) {
        const isSuccess = await submitVote(marketData, isVoteUp);
        if (isSuccess)
          toast.success("Vote submitted successfully.", { autoClose: 2000 });
      }
    },
    [account?.address, marketData, submitVote]
  );

  const tradingPair = useMemo(
    () => ({
      one: marketData?.tradingPair?.one ?? "APT",
      two: marketData?.tradingPair?.two ?? "USD",
    }),
    [marketData?.tradingPair]
  );

  return (
    <div
      className={cn(
        "max-w-full",
        (!marketData || !isVisible(marketData)) && "hidden"
      )}
      style={{ order: marketData ? getPosition(marketData) : 0 }}
    >
      <MarketCardSimpleUiMemo
        startTime={marketData?.startTime ?? 1337}
        createTime={marketData?.createdAt ?? 1337}
        address={marketData?.address ?? "1337"}
        minBet={marketData?.minBet ?? 1337}
        betCloseTime={marketData?.startTime ?? 1336}
        resolveTime={marketData?.endTime ?? 1337}
        tradingPairOne={tradingPair.one}
        tradingPairTwo={tradingPair.two}
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
