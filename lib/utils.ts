import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MarketType } from "./types/market";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function addEllipsis(str: string, startChars = 6, endChars = 4) {
  return (
    str.substring(0, startChars) + "..." + str.substring(str.length - endChars)
  );
}

export function calculateWinFactors(
  upBetsCount: number,
  downBetsCount: number,
  fee: number
): { upWinFactor: number; downWinFactor: number } {
  const totalBets = upBetsCount + downBetsCount;

  const upWinFactor =
    ((totalBets === 0 ? 1 : totalBets) / (upBetsCount + 1)) * (1 - fee) * 2;
  const downWinFactor =
    ((totalBets === 0 ? 1 : totalBets) / (downBetsCount + 1)) * (1 - fee) * 2;

  return { upWinFactor, downWinFactor };
}

export function calculateUserWin(
  upWinFactor: number,
  downWinFactor: number,
  upBetsSum: number,
  downBetsSum: number,
  userBetAmount: number,
  isUp: boolean
): number {
  if (isUp) {
    const potentialBetSum = upBetsSum + userBetAmount;
    const totalUpPotentialWinnings = upWinFactor * potentialBetSum;
    const userShare = userBetAmount / potentialBetSum;
    const userPotentialWin = totalUpPotentialWinnings * userShare;
    return userPotentialWin;
  } else {
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
  return (price / 10 ** 9).toFixed(3);
}
