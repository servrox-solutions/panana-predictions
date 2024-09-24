"use client";

import { marketTypes } from "@/lib/get-available-markets";
import {
  ChevronsDown,
  ChevronsUp,
  Coins,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Undo2,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { calculateUserWin, cn } from "@/lib/utils";
import { MarketCardTimeline } from "./market-card-timeline";
import { DateTime } from "luxon";
import Link from "next/link";

export interface MarketCardSimpleUiProps {
  tradingPair: { one: (typeof marketTypes)[number]; two: string };
  minBet: number;
  betCloseTime: number;
  resolveTime: number;
  upVotesSum: number;
  downVotesSum: number;
  upWinFactor: number;
  downWinFactor: number;
  upBetsSum: number;
  downBetsSum: number;
  upBetsCount: number;
  downBetsCount: number;
  address: string;
  onPlaceBet: (betUp: boolean, amount: number) => void;
  onVote: (isVoteUp: boolean) => void;
}

export const MarketCardSimpleUi: React.FC<MarketCardSimpleUiProps> = ({
  tradingPair,
  minBet,
  betCloseTime,
  resolveTime,
  upVotesSum,
  downVotesSum,
  upWinFactor,
  downWinFactor,
  upBetsSum,
  downBetsSum,
  upBetsCount,
  downBetsCount,
  address,
  onPlaceBet,
  onVote,
}) => {
  const [bet, setBet] = useState<"up" | "down" | null>(null);
  const [amount, setAmount] = useState<number>(minBet + 1);

  return (
    <div className="flex flex-col max-w-sm w-96 backdrop-grayscale-[.5] bg-gray-800 bg-opacity-30 backdrop-blur-lg rounded-3xl p-3 shadow-lg border border-white border-opacity-20">
      {/* Header */}
      <div className="flex justify-between ">
        <div className="flex-1">
          <div className="text-left">
            <Link href={`/markets/${address}`} className="hover:underline">
              <h2 className="text-lg font-semibold">
                Will
                <span className="text-lg text-secondary bg-primary  p-1 rounded mx-1">
                  {tradingPair.one}/{tradingPair.two}
                </span>
                go up or down within{" "}
                {DateTime.fromSeconds(resolveTime)
                  .diff(DateTime.fromSeconds(betCloseTime))
                  .toFormat("hh:mm:ss")}{" "}
                hours?
              </h2>
            </Link>
          </div>
        </div>
        {bet && (
          <div className="flex-0 items-start">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => setBet(null)}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Timeline Section */}
      {!bet && (
        <MarketCardTimeline
          betCloseTime={betCloseTime}
          resolveTime={resolveTime}
        />
      )}

      {/* Stats Section */}
      {bet && (
        <div className="flex justify-between items-center text-center text-opacity-80 h-20">
          <div>
            <p className="font-bold text-sm">{`${downBetsCount} Down`}</p>
            <p className="text-xs">{downBetsSum} APT</p>
          </div>

          <div className="text-center">
            <p className="font-bold text-base">{`${
              downBetsCount + upBetsCount
            } Bets`}</p>
            <p className="text-sm">{downBetsSum + upBetsSum} APT</p>
          </div>

          <div>
            <p className="font-bold text-sm">{`${upBetsCount} Up`}</p>
            <p className="text-xs">{upBetsSum} APT</p>
          </div>
        </div>
      )}

      {/* Bet Buttons Section */}
      {!bet && (
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Button
              className="group w-full font-semibold bg-green-600/70  hover:bg-green-500 text-white relative"
              onClick={() => setBet("up")}
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
              className={`group w-full font-semibold bg-red-600/70  hover:bg-red-500 text-white relative`}
              onClick={() => setBet("down")}
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

      {bet && (
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="number"
            placeholder="Amount"
            defaultValue={minBet + 1}
            onChange={(ev) => setAmount(+ev.target.value)}
            className="text-foreground bg-white/40 dark:bg-black/40"
          />
          <Button
            type="submit"
            className={
              bet === "up"
                ? "w-full font-semibold bg-green-600/70  hover:bg-green-500 text-white relative"
                : "w-full font-semibold bg-red-600/70  hover:bg-red-500 text-white relative"
            }
            onClick={() => onPlaceBet(bet === "up", amount)}
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
        </div>
      )}

      {/* Icons */}
      {!bet && (
        <div className="flex justify-between items-stretch pt-4">
          <div className="flex items-center">
            <Coins className="w-4 h-4" />
            <span className="text-xs text-neutral-400 pl-1">
              {(upBetsSum + downBetsSum) / 10 ** 8} APT
            </span>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="group hover:text-red-500 hover:bg-red-500/20"
              onClick={() => onVote(false)}
            >
              <ThumbsDown className="h-4 w-4" />
              <span className="text-xs text-neutral-400 group-hover:text-red-500 pl-1">
                {downVotesSum}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="group hover:text-green-500 hover:bg-green-500/20"
              onClick={() => onVote(true)}
            >
              <ThumbsUp className="h-4 w-4" />
              <span className="text-xs text-neutral-400 group-hover:text-green-500 pl-1">
                {upVotesSum}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-primary hover:bg-primary/20"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
