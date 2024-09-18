"use client";

import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";

import { Progress } from "./ui/progress";
import { Banana, Lock, PartyPopper } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface MarketCardTimelineProps {
  betCloseTime: number;
  resolveTime: number;
}

export const MarketCardTimeline: React.FC<MarketCardTimelineProps> = ({
  betCloseTime,
  resolveTime,
}) => {
  const [now, setNow] = useState(DateTime.local());
  const [progressPercentageFirstInterval, setProgressPercentageFirstInterval] =
    useState(100);
  const [
    progressPercentageSecondInterval,
    setProgressPercentageSecondInterval,
  ] = useState(100);

  const betCloseDate = DateTime.fromSeconds(betCloseTime);
  const resolveDate = DateTime.fromSeconds(resolveTime);
  const interval = resolveDate.diff(betCloseDate).as("milliseconds");

  //TODO. do interval stuff in the market object
  // Update 'now' every minute to keep the progress bar updated
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(DateTime.local());
    }, 1000); // Update every sec

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (now < betCloseDate) {
      const diffFirstInterval = betCloseDate.diff(now).as("milliseconds");
      setProgressPercentageFirstInterval(
        100 - Math.min(Math.max((diffFirstInterval / interval) * 100, 0), 100)
      );
      setProgressPercentageSecondInterval(0);
    } else if (now > betCloseDate && now < resolveDate) {
      const diffSecondInterval = resolveDate.diff(now).as("milliseconds");
      setProgressPercentageFirstInterval(100);
      setProgressPercentageSecondInterval(
        100 - Math.min(Math.max((diffSecondInterval / interval) * 100, 0), 100)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  // Ensure dates are in the correct order
  if (betCloseDate >= resolveDate) {
    console.error("betCloseTime must be before resolveTime.");
    return null;
  }

  return (
    <div className="flex justify-between items-center pb-6">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full z-10 bg-primary text-primary-foreground h-8 w-8"
            >
              <Banana className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Current time</p>
            <p>{now.toFormat("yyyy-MM-dd HH:mm:ss")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="grow">
        <Progress
          value={progressPercentageFirstInterval}
          className="w-auto -ml-2 -mr-2 h-2"
        />
      </div>

      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full z-10 bg-primary text-primary-foreground h-8 w-8"
            >
              <Lock className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Bets are closed</p>
            <p>{betCloseDate.toFormat("yyyy-MM-dd HH:mm:ss")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="grow">
        <Progress
          value={progressPercentageSecondInterval}
          className="w-auto -ml-2 -mr-2 h-2"
        />
      </div>

      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full z-10 bg-primary text-primary-foreground h-8 w-8"
            >
              <PartyPopper className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Rewards distribution</p>
            <p>{resolveDate.toFormat("yyyy-MM-dd HH:mm:ss")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
