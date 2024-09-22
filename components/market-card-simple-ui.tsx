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
  onPlaceBet,
  onVote,
}) => {
  const [bet, setBet] = useState<"up" | "down" | null>(null);
  const [amount, setAmount] = useState<number>(minBet + 1);

  return (
    <div className="flex flex-col max-w-sm backdrop-grayscale-[.5] bg-gray-800 bg-opacity-30 backdrop-blur-lg rounded-3xl p-3 shadow-lg border border-white border-opacity-20">
      {/* Header */}
      <div className="flex justify-between ">
        <div className="flex-1">
          <div className="text-left mb-4">
            <h2 className="text-lg font-semibold">
              Will
              <span className="text-lg text-secondary bg-primary  p-1 rounded mx-1">
                {tradingPair.one}/{tradingPair.two}
              </span>
              rise or fall during the betting period?
            </h2>
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

      {bet && (
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="number"
            placeholder="Amount"
            defaultValue={minBet + 1}
            onChange={(ev) => setAmount(+ev.target.value)}
            className="text-foreground"
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

      {/* Timer Section */}
      {!bet && (
        // <div className="text-sm text-opacity-80 mb-4">
        //   <p>
        //     Bets are closed in: <span className="font-bold ">5:45</span>
        //   </p>
        //   <p>
        //     Bets can be resolved in: <span className="font-bold ">15:45</span>
        //   </p>
        // </div>
        <MarketCardTimeline
          betCloseTime={betCloseTime}
          resolveTime={resolveTime}
        />
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

      {/* Stats Section */}
      {bet && (
        <div className="mt-6 flex justify-between items-center text-center  text-opacity-80">
          <div>
            <p className="font-bold text-lg">8 Bets</p>
            <p className="text-sm">485,12$</p>
          </div>

          <div className="text-center">
            <p className="font-bold text-2xl">14 Bets</p>
            <p className="text-sm">770,24$</p>
          </div>

          <div>
            <p className="font-bold text-lg">6 Bets</p>
            <p className="text-sm">285,12$</p>
          </div>
        </div>
      )}

      {/* Icons */}
      {!bet && (
        <div className="flex justify-between">
          <div className="flex mt-4 items-center">
            <Coins className="w-4 h-4 mx-2" />
            {(upBetsSum + downBetsSum) / 10 ** 8} APT
          </div>
          <div className="flex justify-end space-x-2 mt-4">
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
