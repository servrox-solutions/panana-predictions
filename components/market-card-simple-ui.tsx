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
import { cn } from "@/lib/utils";
import { MarketCardTimeline } from "./market-card-timeline";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { createEntryPayload } from "@thalalabs/surf";
import { ABI as MarketAbi } from "@/lib/market-abi";
import { aptos } from "@/lib/aptos";
import { Address } from "@/lib/types/market";

export interface MarketCardSimpleUiProps {
  tradingPair: { one: (typeof marketTypes)[number]; two: string };
  minBet: number;
  pool: number;

  betCloseTime: number;
  resolveTime: number;
  market: Address;
  oddsUp: string;
  oddsDown: string;
  upVotesSum: number;
  downVotesSum: number;
}

export const MarketCardSimpleUi: React.FC<MarketCardSimpleUiProps> = ({
  tradingPair = {
    one: "APT",
    two: "USD",
  },
  minBet,
  betCloseTime = 1726666201,
  resolveTime = 1726668901,
  pool = 0,
  market,
  oddsUp,
  oddsDown,
  upVotesSum,
  downVotesSum,
}) => {
  const [bet, setBet] = useState<"up" | "down" | null>(null);
  const [amount, setAmount] = useState<number>(1000);
  const { account, signAndSubmitTransaction } = useWallet();

  const handleBet = (bet: "up" | "down" | null) => {
    setBet(bet);
  };

  async function placeBet(betUp: boolean, amount?: number) {
    console.log(amount);
    if (!account) return;

    try {
      const payload = createEntryPayload(MarketAbi, {
        function: "place_bet",
        typeArguments: [
          `${MarketAbi.address}::switchboard_asset::${tradingPair.one}`,
        ],
        functionArguments: [market, betUp, amount!.toString()],
      });

      const transactionResponse = await signAndSubmitTransaction({
        sender: account.address,
        data: payload,
      });

      console.log("🍧", transactionResponse);

      const committedTransactionResponse = await aptos.waitForTransaction({
        transactionHash: transactionResponse.hash,
      });

      console.log("🍧", committedTransactionResponse);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Transaction failed:", error);
    }
  }

  async function submitVote(isVoteUp: boolean) {
    console.log("isVoteUp", isVoteUp);

    if (!account) return;

    try {
      const payload = createEntryPayload(MarketAbi, {
        function: "vote",
        typeArguments: [
          `${MarketAbi.address}::switchboard_asset::${tradingPair.one}`,
        ],
        functionArguments: [market, isVoteUp],
      });

      const transactionResponse = await signAndSubmitTransaction({
        sender: account.address,
        data: payload,
      });

      console.log("🍧 vote transactionResponse", transactionResponse);

      const committedTransactionResponse = await aptos.waitForTransaction({
        transactionHash: transactionResponse.hash,
      });

      console.log(
        "🍧 vote committedTransactionResponse",
        committedTransactionResponse
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Transaction failed:", error);
    }
  }

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
              onClick={() => handleBet(null)}
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
            defaultValue={minBet}
            onChange={(ev) => {
              setAmount(+ev.target.value);
              console.log(ev.target.value);
            }}
            className="text-foreground"
          />
          <Button
            type="submit"
            className={
              bet === "up"
                ? "w-full font-semibold bg-green-600/70  hover:bg-green-500 text-white relative"
                : "w-full font-semibold bg-red-600/70  hover:bg-red-500 text-white relative"
            }
            onClick={() => placeBet(bet === "up", amount)}
          >
            {bet === "up" ? "Bet Up" : "Bet Down"}
            {bet === "up" ? (
              <ChevronsUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsDown className="ml-2 h-4 w-4" />
            )}
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
              onClick={() => handleBet("up")}
            >
              <span className="z-10">Bet Up</span>
              <ChevronsUp className="ml-2 h-4 w-4" />
              <span
                className={cn(
                  "absolute bottom-0 right-1 -mb-1 text-lg group-hover:text-4xl text-white/30",
                  oddsUp > oddsDown ? "animate-pulse" : ""
                )}
              >
                &times;{oddsUp}
              </span>
            </Button>
          </div>

          <div className="flex-shrink flex flex-row flex-nowrap text-xs space-x-2 mx-2">
            {/* button spaceing */}
          </div>

          <div className="flex-1">
            <Button
              className={`group w-full font-semibold bg-red-600/70  hover:bg-red-500 text-white relative`}
              onClick={() => handleBet("down")}
            >
              <span className="z-10">Bet Down</span>
              <ChevronsDown className="ml-2 h-4 w-4" />
              <span
                className={cn(
                  "absolute bottom-0 right-1 -mb-1 text-lg group-hover:text-4xl text-white/30",
                  oddsDown > oddsUp ? "animate-pulse" : ""
                )}
              >
                &times;{oddsDown}
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
            {pool / 10 ** 8} APT
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="ghost"
              size="icon"
              className="group hover:text-red-500 hover:bg-red-500/20"
              onClick={() => submitVote(false)}
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
              onClick={() => submitVote(true)}
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
