"use client";

import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";

import { Progress } from "./ui/progress";
import { Banana, Lock, PartyPopper } from "lucide-react";
import { Button } from "./ui/button";

interface MarketCardTimelineProps {
  createTime: number;
  betCloseTime: number;
  endTime: number;
}

export const MarketCardTimeline: React.FC<MarketCardTimelineProps> = ({
  createTime,
  betCloseTime,
  endTime,
}) => {
  const [now, setNow] = useState(DateTime.local());
  const [progressPercentageFirstInterval, setProgressPercentageFirstInterval] =
    useState(100);
  const [
    progressPercentageSecondInterval,
    setProgressPercentageSecondInterval,
  ] = useState(100);
  const [remainingTimeFirstInterval, setRemainingTimeFirstInterval] = useState<
    string | null
  >(null);
  const [remainingTimeSecondInterval, setRemainingTimeSecondInterval] =
    useState<string | null>(null);

  const createDate = DateTime.fromSeconds(createTime);
  const betCloseDate = DateTime.fromSeconds(betCloseTime);
  const endDate = DateTime.fromSeconds(endTime);
  const firstInterval = betCloseDate.diff(createDate).as("milliseconds");
  const secondIntervall = endDate.diff(betCloseDate).as("milliseconds");

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(DateTime.local());
    }, 1000); // Update 'now' every second to keep the progress bar + remaining time updated

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (now < betCloseDate) {
      const diffFirstInterval = betCloseDate.diff(now).as("milliseconds");

      setProgressPercentageFirstInterval(
        100 -
          Math.min(
            Math.max(Math.round((diffFirstInterval / firstInterval) * 100), 0),
            100
          )
      );
      setProgressPercentageSecondInterval(0);

      setRemainingTimeFirstInterval(
        betCloseDate.diff(now).toFormat("hh:mm:ss")
      );
      setRemainingTimeSecondInterval(
        endDate.diff(betCloseDate).toFormat("hh:mm:ss")
      );
    } else if (now > betCloseDate && now < endDate) {
      const diffSecondInterval = endDate.diff(now).as("milliseconds");

      setProgressPercentageFirstInterval(100);
      setProgressPercentageSecondInterval(
        100 -
          Math.min(
            Math.max(
              Math.round((diffSecondInterval / secondIntervall) * 100),
              0
            ),
            100
          )
      );

      setRemainingTimeFirstInterval(null);
      setRemainingTimeSecondInterval(endDate.diff(now).toFormat("hh:mm:ss"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  // Ensure dates are in the correct order
  if (betCloseDate >= endDate) {
    console.error("betCloseTime must be before resolveTime.");
    return null;
  }

  return (
    <div className="flex flex-col justify-center py-2">
      <div className="flex flex-row justify-between items-center">
        <div className="w-1/3 text-xs text-muted-foreground text-start">
          Open
        </div>
        <div className="w-1/3 text-xs text-muted-foreground text-center">
          Start
        </div>
        <div className="w-1/3 text-xs text-muted-foreground text-end">End</div>
      </div>

      <div className="flex flex-row justify-between items-center py-2">
        <div className="z-10">
          <Button
            variant="outline"
            size="icon"
            className="bg-primary text-primary-foreground h-8 w-8 -mr-1"
          >
            <Banana className="h-4 w-4" />
          </Button>
        </div>

        <div className="grow relative">
          <Progress
            value={progressPercentageFirstInterval}
            className="w-full h-7 rounded-none opacity-50"
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-foreground">
            {remainingTimeFirstInterval
              ? remainingTimeFirstInterval
              : DateTime.fromMillis(firstInterval).toFormat("hh:mm:ss")}
          </div>
        </div>

        <div className="z-10">
          <Button
            variant="outline"
            size="icon"
            className="z-10 bg-primary text-primary-foreground h-8 w-8 -ml-1 -mr-1"
          >
            <Lock className="h-4 w-4" />
          </Button>
        </div>

        <div className="grow relative">
          <Progress
            value={progressPercentageSecondInterval}
            className="w-full h-7 rounded-none opacity-50"
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-foreground">
            {remainingTimeSecondInterval
              ? remainingTimeSecondInterval
              : DateTime.fromMillis(secondIntervall).toFormat("hh:mm:ss")}
          </div>
        </div>

        <div className="z-10">
          <Button
            variant="outline"
            size="icon"
            className="z-10 bg-primary text-primary-foreground h-8 w-8 -ml-1"
          >
            <PartyPopper className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-row justify-between items-center">
        <div className="w-1/3 text-xs text-muted-foreground text-start">
          <p className="max-w-24 text-wrap mr-auto">
            {createDate.toFormat("yyyy-MM-dd HH:mm:ss")}
          </p>
        </div>
        <div className="w-1/3 text-xs text-muted-foreground text-center">
          <p className="max-w-24 text-wrap mx-auto">
            {betCloseDate.toFormat("yyyy-MM-dd HH:mm:ss")}
          </p>
        </div>
        <div className="w-1/3 text-xs text-muted-foreground text-end">
          <p className="max-w-24 text-wrap ml-auto">
            {endDate.toFormat("yyyy-MM-dd HH:mm:ss")}
          </p>
        </div>
      </div>
    </div>
  );
};
