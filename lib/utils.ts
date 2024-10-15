import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MarketType, MessageKind } from "./types/market";
import { Duration } from "luxon";
import { octasToApt } from './aptos';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function addEllipsis(
  str: string,
  startChars = 6,
  endChars = 4,
  escape = false
) {
  return (
    str.substring(0, startChars) +
    (escape ? "\\.\\.\\." : "...") +
    str.substring(str.length - endChars)
  );
}

export function calculateWinFactors(
  bets: number[]
): number[] {
  const betsInApt = bets.map(bet => octasToApt(bet));
  // const upBetsSumApt = octasToApt(upBetsSum);
  // const downBetsSumApt = octasToApt(downBetsSum);

  const totalBetsSumApt = betsInApt.reduce((prev, cur) => prev + cur, 0);
  if (totalBetsSumApt === 0) {
    return new Array(bets.length).fill(1 / betsInApt.length);
  }

  return betsInApt.map(bet => bet / totalBetsSumApt);
}

export function calculateUserWin(
  upWinFactor: number,
  downWinFactor: number,
  upBetsSum: number,
  downBetsSum: number,
  userBetAmount: number,
  isUp: boolean
): number {

  const totalBetSum = upBetsSum + downBetsSum + userBetAmount;

  if (isUp) {
    return userBetAmount / totalBetSum;
    // const potentialBetSum = upBetsSum + userBetAmount;
    // const totalUpPotentialWinnings = upWinFactor * potentialBetSum;
    // const userShare = userBetAmount / potentialBetSum;
    // const userPotentialWin = totalUpPotentialWinnings * userShare;
    // return userPotentialWin;
  } else {
    return userBetAmount / totalBetSum;
    const potentialBetSum = downBetsSum + userBetAmount;
    const totalDownPotentialWinnings = downWinFactor * potentialBetSum;
    const userShare = userBetAmount / potentialBetSum;
    const userPotentialWin = totalDownPotentialWinnings * userShare;
    return userPotentialWin;
  }
}

export function extractAsset(input: string): MarketType {
  const parts = input.split("::");
  if (parts.length !== 3) {
    throw new Error("cannot extract asset");
  }
  return parts.pop() as MarketType;
}

export function formatAptPrice(price: number): string {
  return octasToApt(price).toFixed(3);
}

export const formatTime = (seconds: number): string => {
  const duration = Duration.fromObject({ seconds });
  const durationWithoutDays = Duration.fromObject({
    seconds: seconds % (60 * 60 * 24),
  });

  const durationHourString = durationWithoutDays.toFormat("hh:mm:ss");
  return Math.floor(duration.as("days")) > 0
    ? `${duration.toFormat("dd")} days ${durationHourString}`
    : durationHourString;
};

export function getMessageByKind(messageKind: MessageKind): string {
  switch (messageKind) {
    case MessageKind.FIVE_MINUTES_BEFORE_BET_CLOSE:
      return "PREDICT: 5 MIN LEFT";
    case MessageKind.FIVE_MINUTES_BEFORE_MARKET_END:
      return "RESOLVE: IN 5 MIN";
  }
}

export function escapeMarkdownV2(text: string) {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

export const convertSmallestUnitToFullUnit = (smallestAmount: number, type: MarketType) => {
  
  if (type === 'APT') {
    return octasToApt(smallestAmount);
  } else {
    return smallestAmount / 10 ** 9;
  }
}