"use client";

import { CircleHelp, TicketPlus, Trophy, Vote } from "lucide-react";

import { cn } from "@/lib/utils";
import { EventMarketType } from "@/lib/types/market";

export interface Web3IconProps extends React.HTMLAttributes<HTMLDivElement> {
  event: EventMarketType;
}

export function EventIcon(props: Web3IconProps) {
  const { event, className } = props;

  switch (event) {
    case "Sports":
      return (
        <Trophy
          className={cn("w-4 h-4", className)}
        />
      );
    // case "Other":
    //   return (
    //     <TicketPlus
    //       className={cn("w-4 h-4 scale-125", className)}
    //     />
    //   );
    case "Politics":
      return (
        <Vote
          className={cn("w-4 h-4 scale-125", className)}
        />
      );
    default:
      return <CircleHelp className={cn("w-4 h-4 scale-125", className)} />;
  }
}
