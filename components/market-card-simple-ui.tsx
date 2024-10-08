"use client";

import { MarketType } from "@/lib/types/market";
import {
  ChartLine,
  ChevronsDown,
  ChevronsUp,
  Coins,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  Undo2,
} from "lucide-react";
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  HatenaIcon,
  HatenaShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";
import React, { useState, useMemo, useCallback } from "react";
import { Button } from "./ui/button";
import { calculateUserWin, cn } from "@/lib/utils";
import { MarketCardTimeline } from "./market-card-timeline";
import Link from "next/link";
import { SimpleContainerDropdown } from "./simple-container-dropdown";
import { MarketTitle } from "./market-title";
import { Card } from "./ui/card";
import DepositBet from "./deposit-bet";
import { Web3Icon } from "./web3-icon";
import { storeTelegramNotification } from "@/lib/supabase/store-telegram-notification";
import { useLaunchParams, useInitData } from "@telegram-apps/sdk-react";
import { DateTime } from "luxon";
import { MessageKind } from "@/lib/types/market";
export interface MarketCardSimpleUiProps {
  tradingPairOne: MarketType; // Destructured property
  tradingPairTwo: string; // Destructured property
  minBet: number;
  betCloseTime: number;
  resolveTime: number;
  createTime: number;
  upVotesSum: number;
  downVotesSum: number;
  upWinFactor: number;
  downWinFactor: number;
  upBetsSum: number;
  downBetsSum: number;
  upBetsCount: number;
  downBetsCount: number;
  address: string;
  startTime: number;
  onPlaceBet: (betUp: boolean, amount: number) => void;
  onVote: (isVoteUp: boolean) => void;
}

export const MarketCardSimpleUi: React.FC<MarketCardSimpleUiProps> = ({
  tradingPairOne,
  tradingPairTwo,
  minBet,
  betCloseTime,
  resolveTime,
  createTime,
  upVotesSum,
  downVotesSum,
  upWinFactor,
  downWinFactor,
  upBetsSum,
  downBetsSum,
  upBetsCount,
  downBetsCount,
  address,
  startTime,
  onPlaceBet,
  onVote,
}) => {
  const [bet, setBet] = useState<"up" | "down" | null>(null);
  const [amount, setAmount] = useState<number>(minBet / 10 ** 8);
  const getSocialMessage = (marketId: string) =>
    `📈 Think you can predict the next move in crypto?\nJoin our latest market and put your forecast to the test!\n\nhttps://app.panana-predictions.xyz/markets/${marketId}\n\nOnly on 🍌Panana Predictions!`;
  const launchParams = useLaunchParams(true);
  const initData = useInitData(true);

  const handleMidClick = async () => {
    const telegramUserId =
      launchParams?.platform !== "mock" ? initData?.user?.id : undefined;

    if (!telegramUserId) return;

    const result = await storeTelegramNotification(
      address,
      telegramUserId,
      DateTime.fromSeconds(betCloseTime).minus({ minutes: 5 }).toString(),
      MessageKind.FIVE_MINUTES_BEFORE_BET_CLOSE
    );

    console.log("result", result);
  };

  // Memoize the MarketCardTimeline component to prevent unnecessary re-renders
  const MemoizedMarketCardTimeline = useMemo(
    () => (
      <MarketCardTimeline
        createTime={createTime}
        betCloseTime={betCloseTime}
        endTime={resolveTime}
        slim={startTime > Date.now() / 1000}
        onMidClick={handleMidClick}
      />
    ),
    [createTime, betCloseTime, resolveTime, handleMidClick]
  );

  // Memoize the onClick handlers to prevent unnecessary re-renders
  const handleBetUp = useCallback(() => setBet("up"), []);
  const handleBetDown = useCallback(() => setBet("down"), []);
  const handleVoteUp = useCallback(() => onVote(true), [onVote]);
  const handleVoteDown = useCallback(() => onVote(false), [onVote]);

  // Memoize the shareElements for SimpleContainerDropdown
  const shareElements = useMemo(
    () => [
      <TwitterShareButton className="w-8 h-8" url={getSocialMessage(address)}>
        <TwitterIcon className="w-8 h-8 rounded-full" />
      </TwitterShareButton>,
      <TelegramShareButton className="w-8 h-8" url={getSocialMessage(address)}>
        <TelegramIcon className="w-8 h-8 rounded-full" />
      </TelegramShareButton>,
      <FacebookShareButton className="w-8 h-8" url={getSocialMessage(address)}>
        <FacebookIcon className="w-8 h-8 rounded-full" />
      </FacebookShareButton>,
      <WhatsappShareButton className="w-8 h-8" url={getSocialMessage(address)}>
        <WhatsappIcon className="w-8 h-8 rounded-full" />
      </WhatsappShareButton>,
      <EmailShareButton className="w-8 h-8" url={getSocialMessage(address)}>
        <EmailIcon className="w-8 h-8 rounded-full" />
      </EmailShareButton>,
      <HatenaShareButton className="w-8 h-8" url={getSocialMessage(address)}>
        <HatenaIcon className="w-8 h-8 rounded-full" />
      </HatenaShareButton>,
    ],
    [address, getSocialMessage]
  );

  // Memoize the MarketTitle component to prevent unnecessary re-renders
  const MemoizedMarketTitle = useMemo(
    () => (
      <MarketTitle
        tradingPair={{ one: tradingPairOne, two: tradingPairTwo }} // Updated to use destructured props
        resolveTime={resolveTime}
        betCloseTime={betCloseTime}
        shortVersion
      />
    ),
    [tradingPairOne, tradingPairTwo, resolveTime, betCloseTime]
  );

  return (
    <Card
      className={cn(
        "w-96 h-48 max-w-full overflow-hidden flex flex-col relative"
      )}
    >
      {/* Background Web3Icon */}
      <div className="absolute inset-0 z-0 flex items-end justify-end opacity-10">
        <Web3Icon
          className="h-1/2 w-1/2 p-2"
          asset={tradingPairOne as MarketType}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center max-w-full">
          <div className="flex flex-nowrap text-left">
            {MemoizedMarketTitle}
          </div>
          {!bet && (
            <div className="flex-1 text-nowrap text-right">
              <SimpleContainerDropdown shareButtons={shareElements} />
              <div className="inline-flex overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="group hover:text-green-500 hover:bg-green-500/20"
                  onClick={handleVoteUp}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-xs dark:text-neutral-400 group-hover:text-green-500 pl-1">
                    {upVotesSum}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="group hover:text-red-500 hover:bg-red-500/20"
                  onClick={handleVoteDown}
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span className="text-xs dark:text-neutral-400 group-hover:text-red-500 pl-1">
                    {downVotesSum}
                  </span>
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="" asChild>
                <Link href={`/markets/${address}`}>
                  <ChartLine className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}

          {bet && (
            <div className="flex-1 text-right space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className=""
                onClick={() => setBet(null)}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col grow justify-between">
          {/* Timeline Section */}
          {!bet && (
            <div className="flex flex-col justify-center h-full">
              {MemoizedMarketCardTimeline}
            </div>
          )}
          <div className="flex flex-col justify-evenly grow">
            {/* Stats Section */}
            {(bet || startTime < Date.now() / 1000) && (
              <div className="flex justify-between items-center text-center text-opacity-80">
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4" color="#00a291" />
                  <span className="bg-gradient-to-r from-positive-1 to-positive-2 inline-block text-transparent bg-clip-text text-xs pl-1">
                    {`${upBetsCount} Bets Up`}
                  </span>
                </div>
                <div className="flex items-center">
                  <TrendingDown className="w-4 h-4" color="#ef0b6e" />
                  <span className="bg-gradient-to-r from-negative-1 to-negative-2 inline-block text-transparent bg-clip-text text-xs pl-1">
                    {`${downBetsCount} Bets Down`}
                  </span>
                </div>
                <div className="flex items-center">
                  <Coins className="w-4 h-4" />
                  <span className="text-xs dark:text-neutral-400 pl-1">
                    {(upBetsSum + downBetsSum) / 10 ** 9} APT
                  </span>
                </div>
              </div>
            )}
            {bet && (
              <DepositBet
                defaultValue={minBet / 10 ** 8}
                onChangeAmount={setAmount}
                currency="APT"
              />
            )}
          </div>
        </div>

        {bet && (
          <Button
            type="submit"
            className={
              bet === "up"
                ? "w-full font-semibold bg-gradient-to-r from-positive-1 to-positive-2 transition-all hover:to-green-500 text-white relative"
                : "w-full font-semibold bg-gradient-to-r from-negative-1 to-negative-2 transition-all hover:to-red-500 text-white relative"
            }
            onClick={() => onPlaceBet(bet === "up", amount * 10 ** 8)}
          >
            {bet === "up" ? "Bet Up" : "Bet Down"}
            {bet === "up" ? (
              <ChevronsUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsDown className="ml-2 h-4 w-4" />
            )}
            <span className="absolute bottom-0 right-1 -mb-1 text-lg group-hover:text-4xl text-white/30">
              +
              {calculateUserWin(
                upWinFactor,
                downWinFactor,
                upBetsSum,
                downBetsSum,
                amount,
                bet === "up"
              ).toLocaleString()}
            </span>
          </Button>
        )}
        {/* Bet Buttons Section */}
        {!bet && startTime > Date.now() / 1000 && (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Button
                className="group w-full font-semibold bg-gradient-to-r from-positive-1 to-positive-2 transition-all hover:to-green-500 text-white relative"
                onClick={handleBetUp}
              >
                <span className="z-10">Bet Up</span>
                <ChevronsUp className="ml-2 h-4 w-4" />
                <span
                  className={cn(
                    "absolute bottom-0 right-1 -mb-1 text-lg group-hover:text-4xl text-white/30",
                    upWinFactor > downWinFactor ? "animate-pulse" : ""
                  )}
                >
                  &times;{upWinFactor.toFixed(2)}
                </span>
              </Button>
            </div>

            <div className="flex-shrink flex flex-row flex-nowrap text-xs space-x-2 mx-2">
              {/* button spaceing */}
            </div>

            <div className="flex-1">
              <Button
                className={`group w-full font-semibold bg-gradient-to-r from-negative-1 to-negative-2 transition-all hover:to-red-500 text-white relative`}
                onClick={handleBetDown}
              >
                <span className="z-10">Bet Down</span>
                <ChevronsDown className="ml-2 h-4 w-4" />
                <span
                  className={cn(
                    "absolute bottom-0 right-1 -mb-1 text-lg group-hover:text-4xl text-white/30",
                    downWinFactor > upWinFactor ? "animate-pulse" : ""
                  )}
                >
                  &times;{downWinFactor.toFixed(2)}
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
