"use client";

import { AvailableMarket } from "@/lib/get-available-markets";
import { EventMarketData, EventMarketType } from "@/lib/types/market";
import { useSubmitVote } from "@/lib/hooks/useSubmitVote";
import { cn } from "@/lib/utils";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from "react-toastify";
import { useCallback } from "react";
import { useEventMarket } from '@/lib/hooks/useEventMarket';
import { useEventMarketDataStore } from '@/lib/atoms/useEventMarketDataStore';
import { useEventMarketData } from '@/lib/hooks/useEventMarketData';
import { EventMarketCardSimpleUi } from './event-market-card-simple-ui';
import { EVENT_MARKET_ABI, MARKET_ABI } from '@/lib/aptos';
import { usePlaceEventMarketBet } from '@/lib/hooks/usePlaceEventMarketBet';

interface EventMarketCardProps {
  availableMarket: AvailableMarket<EventMarketType>;
  initialMarketData?: EventMarketData;
}

export const EventMarketCard: React.FC<EventMarketCardProps> = ({
  availableMarket,
  initialMarketData,
}) => {
  const { marketData: marketDataStore } = useEventMarketDataStore();
  const { filteredMarketData, isVisible, getPosition } = useEventMarketData();
  const { marketData } = useEventMarket(
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
  const { placeBet } = usePlaceEventMarketBet();
  const { submitVote } = useSubmitVote();

  const onPlaceBet = useCallback(
    async (selectedAnswerIdx: number, amount: number) => {
      if (!account?.address) {
        toast.info("Please connect your wallet first.");
        return;
      }
      if (marketData?.accepted !== true) {
        toast.info("Betting only possible on accepted markets.");
        return;
      }
      if (marketData) {
        const isSuccess = await placeBet(marketData, selectedAnswerIdx, amount);
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
        const isSuccess = await submitVote(`${EVENT_MARKET_ABI.address}::event_category::${marketData.category}`, marketData.address, isVoteUp);
        if (isSuccess)
          toast.success("Vote submitted successfully.", { autoClose: 2000 });
      }
    },
    [account?.address, marketData, submitVote]
  );

  return (
    <div
      className={cn(
        "max-w-full",
        (!marketData || !isVisible(marketData)) && "hidden"
      )}
      style={{ order: marketData ? getPosition(marketData) : 0 }}
    >
      {marketData && <EventMarketCardSimpleUi
        marketData={marketData}
        onPlaceBet={onPlaceBet}
        onVote={onVote}
      />
      }

    </div>
  );
};
