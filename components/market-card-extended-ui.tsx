"use client";

import { MarketType } from "@/lib/types/market";
import {
  ChevronsDown,
  ChevronsUp,
  Coins,
  ThumbsDown,
  ThumbsUp,
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
import React, { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { SimpleContainerDropdown } from "./simple-container-dropdown";

export interface MarketCardSimpleUiProps {
  tradingPair: { one: MarketType; two: string };
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
  onPlaceBet: (betUp: boolean, amount: number) => void;
  onVote: (isVoteUp: boolean) => void;
}

export const MarketCardExtendedUi: React.FC<MarketCardSimpleUiProps> = ({
  minBet,
  upVotesSum,
  downVotesSum,
  upWinFactor,
  downWinFactor,
  upBetsSum,
  downBetsSum,
  upBetsCount,
  downBetsCount,
  address,
  onVote,
}) => {
  const [bet, setBet] = useState<"up" | "down" | null>(null);
  const [amount, setAmount] = useState<number>(minBet / 10 ** 9);
  const getSocialMessage = (marketId: string) =>
    `📈 Think you can predict the next move in crypto?\nJoin our latest market and put your forecast to the test!\n\nhttps://app.panana-predictions.xyz/markets/${marketId}\n\nOnly on 🍌Panana Predictions!`;

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

  return (
    <div className="flex flex-col gap-4 max-w-full w-96 backdrop-grayscale-[.5] bg-gray-800 bg-opacity-30 backdrop-blur-lg rounded-3xl p-3 shadow-lg border border-white border-opacity-20">
      {/* Header */}
      <div className="flex justify-between ">
        <div className="flex-1">
          <div className="text-left">
            <Link href={`/markets/${address}`} className="hover:underline">
              <span className="text-lg font-semibold">Make your guess!</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="number"
          step="0.01"
          placeholder="Amount"
          defaultValue={minBet / 10 ** 9}
          onChange={(ev) => setAmount(+ev.target.value)}
          className="text-foreground bg-white/40 dark:bg-black/40"
        />
      </div>

      {/* Stats Section */}

      <div className="flex justify-between items-center text-center text-opacity-80 h-20">
        <div>
          <p className="font-bold text-sm">{`${downBetsCount} Down`}</p>
          <p className="text-xs">{downBetsSum} APT</p>
        </div>

        <div className="text-center">
          <p className="font-bold">{`${downBetsCount + upBetsCount} Bets`}</p>
          <p className="text-sm">{downBetsSum + upBetsSum} APT</p>
        </div>

        <div>
          <p className="font-bold text-sm">{`${upBetsCount} Up`}</p>
          <p className="text-xs">{upBetsSum} APT</p>
        </div>
      </div>

      {/* Bet Buttons Section */}

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Button
            className="group w-full font-semibold bg-gradient-to-r from-positive-1 to-positive-2 transition-all hover:to-green-500 text-white relative"
            onClick={() => setBet("up")}
          >
            <span className="z-10">Bet Up</span>
            <ChevronsUp className="ml-2 h-4 w-4" />
            <span
              className={cn(
                "absolute bottom-0 right-1 -mb-1 text-lg group-hover:text-4xl",
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
            className={`group w-full font-semibold bg-gradient-to-r from-negative-1 to-negative-2 transition-all hover:to-red-500 relative`}
            onClick={() => setBet("down")}
          >
            <span className="z-10">Bet Down</span>
            <ChevronsDown className="ml-2 h-4 w-4" />
            <span
              className={cn(
                "absolute bottom-0 right-1 -mb-1 text-lg group-hover:text-4xl",
                downWinFactor > upWinFactor ? "animate-pulse" : ""
              )}
            >
              &times;{downWinFactor.toFixed(2)}
            </span>
          </Button>
        </div>
      </div>

      {/* Icons */}

      <div className="flex justify-between items-stretch pt-4">
        <div className="flex items-center">
          <Coins className="w-4 h-4" />
          <span className="text-xs pl-1">
            {(upBetsSum + downBetsSum) / 10 ** 9} APT
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
            <span className="text-xs group-hover:text-red-500 pl-1">
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
            <span className="text-xs group-hover:text-green-500 pl-1">
              {upVotesSum}
            </span>
          </Button>

          <SimpleContainerDropdown shareButtons={shareElements} />
        </div>
      </div>
    </div>
  );
};
