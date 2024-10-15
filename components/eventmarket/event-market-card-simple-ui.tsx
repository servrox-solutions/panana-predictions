"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Button } from "../ui/button";
import { cn, calculateUserWin } from "@/lib/utils";
import { SimpleContainerDropdown } from "../simple-container-dropdown";
import { Card } from "../ui/card";
import DepositBet from "../deposit-bet";
import {
  ChartLine,
  Coins,
  Share2,
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
import { Address, EventMarketData } from "@/lib/types/market";
import Link from "next/link";
import { aptToOctas, octasToApt } from '@/lib/aptos';
import { VoteDropdown } from '../market/vote-dropdown';

export interface EventMarketCardSimpleUiProps extends EventMarketData {
  onPlaceBet: (idx: number, amount: number) => void;
  onVote: (isVoteUp: boolean) => void;
}

export const EventMarketCardSimpleUi: React.FC<
  EventMarketCardSimpleUiProps
> = ({
  address,
  minBet,
  upVotesSum,
  downVotesSum,
  upWinFactor,
  downWinFactor,
  answers,
  totalBets,
  question,
  onPlaceBet,
  onVote,
}) => {
    const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<
      number | undefined
    >(undefined);
    const [amount, setAmount] = useState<number>(octasToApt(minBet));
    const getSocialMessage = (marketId: string) =>
      `📊 Participate in the latest prediction market: "${question}"!\n\nJoin the challenge: https://app.panana-predictions.xyz/eventmarkets/${marketId}`;

    const handleVoteUp = useCallback(() => onVote(true), [onVote]);
    const handleVoteDown = useCallback(() => onVote(false), [onVote]);

    const containers = useMemo(
      () => (
        <div className="grid grid-cols-3 gap-2">
          <TwitterShareButton className="w-8 h-8" url={getSocialMessage(address)}>
            <TwitterIcon className="w-8 h-8 rounded-full" />
          </TwitterShareButton>
          <TelegramShareButton
            className="w-8 h-8"
            url={getSocialMessage(address)}
          >
            <TelegramIcon className="w-8 h-8 rounded-full" />
          </TelegramShareButton>
          <FacebookShareButton
            className="w-8 h-8"
            url={getSocialMessage(address)}
          >
            <FacebookIcon className="w-8 h-8 rounded-full" />
          </FacebookShareButton>
          <WhatsappShareButton
            className="w-8 h-8"
            url={getSocialMessage(address)}
          >
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
      <Card
        className={cn(
          "w-96 h-56 max-w-full overflow-hidden flex flex-col relative p-0"
        )}
      >
        {/* Background Web3Icon */}
        <div className="absolute inset-0 z-0 flex items-center justify-start opacity-10">
          <TrophyIcon className="h-1/2 w-1/2 p-2" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full gap-4">
          {/* Header */}
          <FrontHeader
            question={question}
            selectedAnswerIdx={selectedAnswerIdx}
            setSelectedAnswerIdx={setSelectedAnswerIdx}
            address={address}
          />
          <div className="flex flex-col gap-4 px-4">
            {selectedAnswerIdx === undefined ? (
              <AnswerSelection
                answers={answers}
                handleBet={setSelectedAnswerIdx}
                upWinFactor={upWinFactor}
                downWinFactor={downWinFactor}
              />
            ) : (
              <BettingArea
                buttonText={
                  selectedAnswerIdx !== undefined
                    ? answers[selectedAnswerIdx]
                    : "Answer"
                }
                winFactor={calculateUserWin(
                  upWinFactor,
                  downWinFactor,
                  1,
                  1,
                  amount,
                  true
                )}
                amount={aptToOctas(amount)}
                selectedAnswerIdx={selectedAnswerIdx}
                minBet={minBet}
                setAmount={setAmount}
                onPlaceBet={onPlaceBet}
              />
            )}
            <FrontFooter
              containers={containers}
              handleVoteUp={handleVoteUp}
              upVotesSum={upVotesSum}
              handleVoteDown={handleVoteDown}
              downVotesSum={downVotesSum}
              address={address}
              totalBets={totalBets}
            />
          </div>
        </div>
      </Card>
    );
  };

function FrontHeader({
  question,
  selectedAnswerIdx,
  setSelectedAnswerIdx,
  address,
}: {
  question: string;
  selectedAnswerIdx?: number;
  setSelectedAnswerIdx: (idx?: number) => void;
  address: Address;
}) {
  return (
    <div className="h-12 font-bold dark:text-secondary px-4 bg-primary rounded flex justify-between items-center max-w-full">
      <Link
        className="w-full line-clamp-2 hover:underline"
        href={`/eventmarkets/${address}`}
      >
        {question}
      </Link>
      <div
        className={cn(
          "flex-1 text-right space-x-2",
          selectedAnswerIdx === undefined && "invisible"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-transparent"
          onClick={() => setSelectedAnswerIdx(undefined)}
        >
          <Undo2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function BettingArea({
  buttonText,
  winFactor,
  selectedAnswerIdx: betAnswerIdx,
  amount,
  minBet,
  setAmount,
  onPlaceBet,
}: {
  buttonText: string;
  winFactor: number;
  selectedAnswerIdx: number;
  amount: number;
  minBet: number;
  setAmount: (amount: number) => void;
  onPlaceBet: (idx: number, amount: number) => void;
}) {
  return (
    <>
      <DepositBet
        defaultValue={octasToApt(minBet)}
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
  );
}

function AnswerSelection({
  answers,
  handleBet,
  upWinFactor,
  downWinFactor,
}: {
  answers: string[];
  handleBet: (idx: number) => void;
  upWinFactor: number;
  downWinFactor: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 flex-grow-1 w-full overflow-y-auto max-h-[100px] min-h-[100px]">
      {answers.map((answer, idx) => (
        <>
          <div className="col-span-2">{answer}</div>
          <Button
            className="group w-full h-6 font-semibold bg-gradient-to-r from-positive-1 to-positive-2 transition-all hover:to-green-500 text-white relative"
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
        </>
      ))}
    </div>
  );
}

function FrontFooter({
  containers,
  handleVoteUp,
  upVotesSum,
  handleVoteDown,
  downVotesSum,
  address,
  totalBets,
}: {
  containers: React.JSX.Element;
  handleVoteUp: () => void;
  upVotesSum: number;
  handleVoteDown: () => void;
  downVotesSum: number;
  address: string;
  totalBets: number[];
}) {
  return (
    <div className="flex">
      <SimpleContainerDropdown
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-primary hover:bg-primary/20"
            disabled={[containers].length === 0}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        }
        buttons={[containers]}
      />
      <div className="inline-flex overflow-hidden">
        <VoteDropdown
          upVotesSum={upVotesSum}
          downVotesSum={downVotesSum}
          onVote={(voteUp: boolean) => voteUp ? handleVoteUp() : handleVoteDown()}
        />
      </div>
      <Button variant="ghost" size="icon" asChild>
        <Link href={`/eventmarkets/${address}`}>
          <ChartLine className="h-4 w-4" />
        </Link>
      </Button>
      <div className="flex flex-1 items-center justify-end">
        <Coins className="w-4 h-4" />
        <span className="text-xs dark:text-neutral-400 pl-1">
          {octasToApt(totalBets.reduce((acc, val) => acc + val, 0)).toFixed(2)}{" "}
          APT
        </span>
      </div>
    </div>
  );
}
