"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Button } from "../ui/button";
import { cn, calculateUserWin } from "@/lib/utils";
import { SimpleContainerDropdown } from "../simple-container-dropdown";
import { Card } from "../ui/card";
import DepositBet from "../deposit-bet";
import {
  Coins,
  ThumbsDown,
  ThumbsUp,
  TrophyIcon,
  Undo2,
} from "lucide-react";
import {
  TwitterShareButton,
  TelegramShareButton,
  FacebookShareButton,
  WhatsappShareButton,
  EmailShareButton,
  HatenaShareButton,
  TwitterIcon,
  TelegramIcon,
  FacebookIcon,
  WhatsappIcon,
  EmailIcon,
  HatenaIcon,
} from "react-share";
import { Address, EventMarketData } from '@/lib/types/market';
import { EVENT_MARKET_ABI } from '@/lib/aptos';
import { usePlaceEventMarketBet } from '@/lib/hooks/usePlaceEventMarketBet';
import { useSubmitVote } from '@/lib/hooks/useSubmitVote';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { toast } from 'react-toastify';

export interface EventMarketCardExtendedUiProps extends EventMarketData {

}

export const EventMarketCardExtendedUi: React.FC<EventMarketCardExtendedUiProps> = ({
  address,
  minBet,
  upVotesSum,
  downVotesSum,
  upWinFactor,
  downWinFactor,
  answers,
  totalBets,
  accepted,
  question,
}) => {
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | undefined>(undefined);
  const [amount, setAmount] = useState<number>(minBet / 10 ** 8);
  const getSocialMessage = (marketId: string) =>
    `📊 Participate in the latest prediction market: "${question}"!\n\nJoin the challenge: https://app.panana-predictions.xyz/eventmarkets/${marketId}`;

  const { account } = useWallet();
  const { placeBet } = usePlaceEventMarketBet();
  const { submitVote } = useSubmitVote();


  const onPlaceBet = useCallback(
    async (selectedAnswerIdx: number, amount: number) => {
      if (!account?.address) {
        toast.info("Please connect your wallet first.");
        return;
      }
      if (accepted !== true) {
        toast.info("Betting only possible on accepted markets.");
        return;
      }
      if (address) {
        const isSuccess = await placeBet(address, selectedAnswerIdx, amount);
        if (isSuccess) toast.success("Bet placed successfully.");
      }
    },
    [address, accepted, placeBet]
  );

  const onVote = useCallback(
    async (isVoteUp: boolean) => {
      if (!account?.address) {
        toast.info("Please connect your wallet first.", { autoClose: 2000 });
        return;
      }
      const isSuccess = await submitVote(`${EVENT_MARKET_ABI.address}::event_category::Sports`, address, isVoteUp);
      if (isSuccess)
        toast.success("Vote submitted successfully.", { autoClose: 2000 });

    },
    [address, submitVote]
  );


  const containers = useMemo(
    () => (
      <div className="grid grid-cols-3 gap-2">
        <TwitterShareButton className="w-8 h-8" url={getSocialMessage(address)}>
          <TwitterIcon className="w-8 h-8 rounded-full" />
        </TwitterShareButton>
        <TelegramShareButton className="w-8 h-8" url={getSocialMessage(address)}>
          <TelegramIcon className="w-8 h-8 rounded-full" />
        </TelegramShareButton>
        <FacebookShareButton className="w-8 h-8" url={getSocialMessage(address)}>
          <FacebookIcon className="w-8 h-8 rounded-full" />
        </FacebookShareButton>
        <WhatsappShareButton className="w-8 h-8" url={getSocialMessage(address)}>
          <WhatsappIcon className="w-8 h-8 rounded-full" />
        </WhatsappShareButton>
        <EmailShareButton className="w-8 h-8" url={getSocialMessage(address)}>
          <EmailIcon className="w-8 h-8 rounded-full" />
        </EmailShareButton>
        <HatenaShareButton className="w-8 h-8" url={getSocialMessage(address)}>
          <HatenaIcon className="w-8 h-8 rounded-full" />
        </HatenaShareButton>
      </div>
    ),
    [address, getSocialMessage]
  );

  return (
    <Card className={cn("max-w-full flex flex-col relative p-0")}>
      {/* Background Web3Icon */}
      <div className="absolute inset-0 z-0 flex items-center justify-start opacity-10">
        <TrophyIcon className="h-1/2 w-1/2 p-2" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-4">
        {/* Header */}
        <FrontHeader question={question} selectedAnswerIdx={selectedAnswerIdx} setSelectedAnswerIdx={setSelectedAnswerIdx} address={address} />
        <div className="flex flex-col gap-4 px-4">
          {
            selectedAnswerIdx === undefined ?
              <AnswerSelection answers={answers} handleBet={setSelectedAnswerIdx} upWinFactor={upWinFactor} downWinFactor={downWinFactor} /> :
              <BettingArea buttonText={selectedAnswerIdx !== undefined ? answers[selectedAnswerIdx] : 'Answer'} winFactor={calculateUserWin(
                upWinFactor,
                downWinFactor,
                1,
                1,
                amount,
                true
              )} amount={amount * 10 ** 8} selectedAnswerIdx={selectedAnswerIdx} minBet={minBet} setAmount={setAmount} onPlaceBet={onPlaceBet} />
          }
          <FrontFooter containers={containers} handleVoteUp={() => onVote(true)} upVotesSum={upVotesSum} handleVoteDown={() => onVote(false)} downVotesSum={downVotesSum} address={address} totalBets={totalBets} />
        </div>
      </div>
    </Card>
  );
};

function FrontHeader({ question, selectedAnswerIdx, setSelectedAnswerIdx, address }: { question: string, selectedAnswerIdx?: number, setSelectedAnswerIdx: (idx?: number) => void, address: Address }) {
  return (
    <div className="h-12 font-bold dark:text-secondary px-4 bg-primary rounded-t-2xl flex justify-between items-center max-w-full">
      <div className="w-full line-clamp-2">
        {question}
      </div>
      <div className={cn('flex-1 text-right space-x-2', selectedAnswerIdx === undefined && 'invisible')}>
        <Button variant="ghost" size="icon" className="hover:bg-transparent" onClick={() => setSelectedAnswerIdx(undefined)}>
          <Undo2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function BettingArea({ buttonText, winFactor, selectedAnswerIdx: betAnswerIdx, amount, minBet, setAmount, onPlaceBet }: { buttonText: string, winFactor: number, selectedAnswerIdx: number, amount: number, minBet: number, setAmount: (amount: number) => void, onPlaceBet: (idx: number, amount: number) => void }) {
  return (
    <>
      <DepositBet
        defaultValue={minBet / 10 ** 8}
        onChangeAmount={setAmount}
        currency="APT"
      />
      <Button
        type="submit"
        className="w-full font-semibold bg-gradient-to-r from-positive-1 to-positive-2 transition-all hover:to-green-500 text-white relative"
        onClick={() => onPlaceBet(betAnswerIdx, amount)}
      >
        Bet on {buttonText}
        <span className="absolute bottom-0 right-1 -mb-1 text-lg group-hover:text-4xl text-white/30">
          +{winFactor.toLocaleString()}
        </span>
      </Button>
    </>
  )
}

function AnswerSelection({ answers, handleBet, upWinFactor, downWinFactor }: { answers: string[], handleBet: (idx: number) => void, upWinFactor: number, downWinFactor: number }) {
  return (
    <div className="flex flex-col flex-grow-1 w-full gap-2">
      {answers.map((answer, idx) => (
        <div className={cn('grid rounded-md grid-cols-3 items-center px-4', idx % 2 === 0 ? 'bg-[#FFFFFF33]' : '')}>
          <div className="col-span-2 text-xl py-4 h-full flex items-center">{answer}</div>
          <Button
            className="group w-full font-semibold bg-gradient-to-r from-positive-1 to-positive-2 transition-all hover:to-green-500 text-white relative"
            onClick={() => handleBet(idx)}
          >
            <span className="z-10">Bet</span>
            {/* <ChevronsUp className="ml-2 h-4 w-4" /> */}
            <span
              className={cn(
                "absolute bottom-0 right-1 -mb-1 text-sm group-hover:text-lg text-white/30",
                upWinFactor > downWinFactor ? "animate-pulse" : ""
              )}
            >
              &times;{upWinFactor.toFixed(2)}
            </span>
          </Button>
        </div>
      ))}
    </div>
  );
}

function FrontFooter(
  { containers, handleVoteUp, upVotesSum, handleVoteDown, downVotesSum, address, totalBets }: {
    containers: React.JSX.Element,
    handleVoteUp: () => void,
    upVotesSum: number,
    handleVoteDown: () => void,
    downVotesSum: number,
    address: string,
    totalBets: number[]
  }
) {
  return (
    <div className="flex">
      <SimpleContainerDropdown shareButtons={[containers]} />
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
      {/* <Button variant="ghost" size="icon" asChild>
        <Link href={`/markets/${address}`}>
          <ChartLine className="h-4 w-4" />
        </Link>
      </Button> */}
      <div className="flex flex-1 items-center justify-end">
        <Coins className="w-4 h-4" />
        <span className="text-xs dark:text-neutral-400 pl-1">
          {(totalBets.reduce((acc, val) => acc + val, 0) / 10 ** 9).toFixed(2)} APT
        </span>
      </div>
    </div>
  );
}

