"use client";

import { MarketType } from "@/lib/types/market";
import {
  ChartLine,
  ChevronsDown,
  ChevronsUp,
  Coins,
  TrendingDown,
  TrendingUp,
  Undo2,
} from "lucide-react";

import React, { useState, useMemo, useCallback } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { MarketCardTimeline } from "./market-card-timeline";
import Link from "next/link";
import { MarketTitle } from "./market-title";
import { Card } from "../ui/card";
import DepositBet from "../deposit-bet";
import { Web3Icon } from "../web3-icon";
import { MessageKind } from "@/lib/types/market";
import { ShareDropdown } from "./share-dropdown";
import { VoteDropdown } from "./vote-dropdown";
import { NotificationDropdown } from "./notification-dropdown";
import { isTelegramApp } from "@/lib/telegram";
import { aptToOctas, octasToApt } from "@/lib/aptos";
import { PricePercentageChange } from "./price-percentage-change";

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
  onSetupNotification: (messageKind: MessageKind) => void;
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
  onSetupNotification,
}) => {
  const [bet, setBet] = useState<"up" | "down" | null>(null);
  const [amount, setAmount] = useState<number>(octasToApt(minBet));

  // Memoize the MarketCardTimeline component to prevent unnecessary re-renders
  const MemoizedMarketCardTimeline = useMemo(
    () => (
      <MarketCardTimeline
        createTime={createTime}
        betCloseTime={betCloseTime}
        endTime={resolveTime}
        slim={startTime > Date.now() / 1000}
      />
    ),
    [createTime, betCloseTime, resolveTime]
  );

  // Memoize the onClick handlers to prevent unnecessary re-renders
  const handleBetUp = useCallback(() => setBet("up"), []);
  const handleBetDown = useCallback(() => setBet("down"), []);

  // Memoize the MarketTitle component to prevent unnecessary re-renders
  const MemoizedMarketTitle = useMemo(
    () => (
      <MarketTitle
        tradingPair={{ one: tradingPairOne, two: tradingPairTwo }} // Updated to use destructured props
        resolveTime={resolveTime}
        betCloseTime={betCloseTime}
        titleLinkHref={`/markets/${address}`}
        shortVersion
        showTime={false}
      />
    ),
    [tradingPairOne, tradingPairTwo, resolveTime, betCloseTime]
  );

  const MemoizedPricePercentageChange = useMemo(
    () => (
      <PricePercentageChange
        tradingPair={tradingPairOne}
        createdAt={createTime}
        startTime={startTime}
        endTime={resolveTime}
      />
    ),
    [tradingPairOne, createTime, startTime, resolveTime]
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
            {MemoizedPricePercentageChange}
          </div>
          {!bet && (
            <div className="flex-1 text-nowrap text-right">
              <ShareDropdown address={address} />
              <div className="inline-flex overflow-hidden">
                <VoteDropdown
                  upVotesSum={upVotesSum}
                  downVotesSum={downVotesSum}
                  onVote={onVote}
                />
              </div>
              {isTelegramApp() && (
                <NotificationDropdown
                  onSetupNotification={onSetupNotification}
                />
              )}
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
                    {octasToApt(upBetsSum + downBetsSum)} APT
                  </span>
                </div>
              </div>
            )}
            {bet && (
              <DepositBet
                defaultValue={octasToApt(minBet)}
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
            onClick={() => onPlaceBet(bet === "up", aptToOctas(amount))}
          >
            {bet === "up" ? "Bet Up" : "Bet Down"}
            {bet === "up" ? (
              <ChevronsUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsDown className="ml-2 h-4 w-4" />
            )}
            <span className="absolute bottom-0 right-1 -mb-1 text-lg group-hover:text-4xl text-white/30">
              {((bet === "up" ? upWinFactor : downWinFactor) * 100).toFixed(0)}{" "}
              %
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
                  {(upWinFactor * 100).toFixed(0)} %
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
                  {(downWinFactor * 100).toFixed(0)} %
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
