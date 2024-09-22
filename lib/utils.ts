import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function addEllipsis(str: string, startChars = 6, endChars = 4) {
  return (
    str.substring(0, startChars) + "..." + str.substring(str.length - endChars)
  );
}

export function calculateOdds(
  upBetsSum: number,
  downBetsSum: number
): {
  oddsUp: string;
  oddsDown: string;
} {
  const totalSum = upBetsSum + downBetsSum;
  if (totalSum === 0) {
    return { oddsUp: "2.00", oddsDown: "2.00" };
  }

  const probabilityUp = upBetsSum / totalSum;
  const probabilityDown = downBetsSum / totalSum;

  const oddsUp = 1 / probabilityUp + 1;
  const oddsDown = 1 / probabilityDown + 1;

  return {
    oddsUp: oddsUp === Infinity ? "1.00" : oddsUp.toFixed(2),
    oddsDown: oddsDown === Infinity ? "1.00" : oddsDown.toFixed(2),
  };
}
