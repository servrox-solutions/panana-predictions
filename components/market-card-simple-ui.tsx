"use client";

import { marketTypes } from "@/lib/get-available-markets";
import {
  ChevronsDown,
  ChevronsUp,
  CircleX,
  Share,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export interface MarketCardSimpleUiProps {
  tradingPair: { one: (typeof marketTypes)[number]; two: string };
}

export const MarketCardSimpleUi: React.FC<MarketCardSimpleUiProps> = ({
  tradingPair = {
    one: "APT",
    two: "USD",
  },
}) => {
  const [bet, setBet] = useState<"up" | "down" | null>("up");

  const handleBet = (bet: "up" | "down" | null) => {
    setBet(bet);
  };

  return (
    <div className="flex flex-col max-w-sm bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-3 shadow-lg border border-white border-opacity-20">
      {/* Header */}
      <div className="flex justify-between ">
        <div className="flex-1">
          <div className="text-left mb-4">
            <h2 className="text-lg font-semibold">
              Will
              <span className="text-lg bg-primary text-foreground p-1 rounded mx-1">
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
              <CircleX className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {bet && (
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="number"
            placeholder="Amount"
            className="text-foreground"
          />
          <Button
            type="submit"
            className={
              bet === "up"
                ? "bg-green-500 text-foreground"
                : "bg-red-500 text-foreground"
            }
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
        <div className="text-sm text-opacity-80 mb-4">
          <p>
            Bets are closed in: <span className="font-bold ">5:45</span>
          </p>
          <p>
            Bets can be resolved in: <span className="font-bold ">15:45</span>
          </p>
        </div>
      )}

      {/* Bet Buttons Section */}
      {!bet && (
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Button
              className="w-full font-semibold bg-green-700/50 text-green-500 hover:bg-green-500 hover:text-white"
              onClick={() => handleBet("up")}
            >
              Bet Up <ChevronsUp className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="mx-4 flex-shrink text-center text-xs">
            Max Win <br />
            <span className="text-sm">1000$</span>
          </div>

          <div className="flex-1">
            <Button
              className={`w-full font-semibold bg-red-700/50 text-red-500 hover:bg-red-500 hover:text-white"
            }`}
              onClick={() => handleBet("down")}
            >
              Bet Down <ChevronsDown className="ml-2 h-4 w-4" />
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
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-red-500 hover:bg-red-500/20"
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-green-500 hover:bg-green-500/20"
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-primary hover:bg-primary/20"
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
