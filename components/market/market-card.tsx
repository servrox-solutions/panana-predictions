"use client";

import { useMarket } from "@/lib/hooks/useMarket";
import { AvailableMarket } from "@/lib/get-available-markets";
import { MarketCardSimpleUi } from "./market-card-simple-ui";
import { MarketData, MarketType, MessageKind } from "@/lib/types/market";
import { usePlaceBet } from "@/lib/hooks/usePlaceBet";
import { useSubmitVote } from "@/lib/hooks/useSubmitVote";
import { useMarketData } from "@/lib/hooks/useMarketData";
import { useMarketDataStore } from "@/lib/atoms/useMarketDataStore";
import { cn } from "@/lib/utils";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from "react-toastify";
import { MARKET_ABI } from "@/lib/aptos";
import { useMemo, useCallback, memo } from "react";
import { storeTelegramNotification } from "@/lib/supabase/store-telegram-notification";
import { useLaunchParams, useInitData } from "@telegram-apps/sdk-react";
import { DateTime } from "luxon";

interface MarketCardProps {
  availableMarket: AvailableMarket<MarketType>;
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

  const launchParams = useLaunchParams(true);
  const initData = useInitData(true);

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
        const isSuccess = await submitVote(
          `${MARKET_ABI.address}::switchboard_asset::${marketData.tradingPair.one}`,
          marketData.address,
          isVoteUp
        );
        if (isSuccess)
          toast.success("Vote submitted successfully.", { autoClose: 2000 });
      }
    },
    [account?.address, marketData, submitVote]
  );

  const onSetupNotification = useCallback(
    async (messageKind: MessageKind) => {
      const telegramUserId =
        launchParams?.platform !== "mock" ? initData?.user?.id : undefined;

      if (
        !telegramUserId ||
        !marketData?.address ||
        !marketData?.startTime ||
        !marketData?.endTime
      )
        return;

      let timeToSend: string | undefined;

      if (messageKind === MessageKind.FIVE_MINUTES_BEFORE_BET_CLOSE) {
        timeToSend = DateTime.fromSeconds(marketData.startTime)
          .minus({ minutes: 5 })
          .toString();
      } else if (messageKind === MessageKind.FIVE_MINUTES_BEFORE_MARKET_END) {
        timeToSend = DateTime.fromSeconds(marketData.endTime)
          .minus({
            minutes: 5,
          })
          .toString();
      } else {
        return;
      }

      const result = await storeTelegramNotification(
        marketData.address,
        telegramUserId,
        timeToSend,
        messageKind
      );

      console.log("result", result);
    },
    [launchParams, initData, marketData]
  );

  const tradingPair = useMemo(
    () => ({
      one: marketData?.tradingPair?.one ?? "APT",
      two: marketData?.tradingPair?.two ?? "USD",
    }),
    [marketData?.tradingPair]
  );

  const memoizedProps = useMemo(
    () => ({
      startTime: marketData?.startTime ?? 1337,
      createTime: marketData?.createdAt ?? 1337,
      address: marketData?.address ?? "1337",
      minBet: marketData?.minBet ?? 1337,
      betCloseTime: marketData?.startTime ?? 1336,
      resolveTime: marketData?.endTime ?? 1337,
      tradingPairOne: tradingPair.one,
      tradingPairTwo: tradingPair.two,
      upVotesSum: marketData?.upVotesSum ?? 1337,
      downVotesSum: marketData?.downVotesSum ?? 1337,
      upWinFactor: marketData?.upWinFactor ?? 0.5,
      downWinFactor: marketData?.downWinFactor ?? 0.5,
      upBetsSum: marketData?.upBetsSum ?? 1337,
      downBetsSum: marketData?.downBetsSum ?? 1337,
      upBetsCount: marketData?.upBets.size ?? 1337,
      downBetsCount: marketData?.downBets.size ?? 1337,
      onPlaceBet,
      onVote,
      onSetupNotification,
    }),
    [marketData, tradingPair, onPlaceBet, onVote]
  );

  return (
    <div
      className={cn(
        "max-w-full",
        (!marketData || !isVisible(marketData)) && "hidden"
      )}
      style={{ order: marketData ? getPosition(marketData) : 0 }}
    >
      <MarketCardSimpleUiMemo {...memoizedProps} />
    </div>
  );
};
