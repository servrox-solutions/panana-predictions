"use client";

import { CircleHelp } from "lucide-react";

import {
  NetworkAptos,
  NetworkBitcoin,
  NetworkEthereum,
  NetworkSolana,
  TokenUSDC,
} from "@web3icons/react";
import { cn } from "@/lib/utils";
import { MarketType } from "@/lib/types/market";

export interface Web3IconProps extends React.HTMLAttributes<HTMLDivElement> {
  asset: MarketType;
}

export function Web3Icon(props: Web3IconProps) {
  const { asset, className } = props;

  switch (asset) {
    case "APT":
      return (
        <NetworkAptos
          variant="branded"
          className={cn("w-4 h-4 dark:invert", className)}
        />
      );
    case "SOL":
      return (
        <NetworkSolana
          variant="branded"
          className={cn("w-4 h-4 scale-125", className)}
        />
      );
    case "USDC":
      return (
        <TokenUSDC
          variant="branded"
          className={cn("w-4 h-4 scale-125", className)}
        />
      );
    case "BTC":
      return (
        <NetworkBitcoin
          variant="branded"
          className={cn("w-4 h-4 scale-125", className)}
        />
      );
    case "ETH":
      return (
        <NetworkEthereum
          variant="branded"
          className={cn("w-4 h-4 scale-125", className)}
        />
      );
    default:
      return <CircleHelp className={cn("w-4 h-4 scale-125", className)} />;
  }
}
