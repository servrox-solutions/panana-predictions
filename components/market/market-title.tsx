import { cn } from "@/lib/utils";
import { TrendingUpDown } from "lucide-react";
import { DateTime, Duration } from "luxon";
import Link from "next/link";

export interface MarketTitleProps {
  tradingPair: {
    one: string;
    two: string;
  };
  resolveTime: number;
  betCloseTime: number;
  titleLinkHref?: string;
  as?: any;
  className?: string;
  shortVersion?: boolean;
  showTime?: boolean;
}

export const MarketTitle = ({
  tradingPair,
  resolveTime,
  betCloseTime,
  as: Tag = "h2",
  className,
  shortVersion = false,
  showTime = true,
  titleLinkHref,
}: MarketTitleProps) => {
  const diff = DateTime.fromSeconds(resolveTime).diff(
    DateTime.fromSeconds(betCloseTime)
  );

  // Got function from here: https://github.com/moment/luxon/issues/1134
  function toHuman(dur: Duration, smallestUnit = "seconds"): string {
    const units = [
      "years",
      "months",
      "days",
      "hours",
      "minutes",
      "seconds",
      "milliseconds",
    ];
    const smallestIdx = units.indexOf(smallestUnit);
    const entries = Object.entries(
      dur
        .shiftTo(...(units as any))
        .normalize()
        .toObject()
    ).filter(([_unit, amount], idx) => amount > 0 && idx <= smallestIdx);
    const dur2 = Duration.fromObject(
      entries.length === 0 ? { [smallestUnit]: 0 } : Object.fromEntries(entries)
    );
    return dur2.reconfigure({ locale: "en-GB" }).toHuman();
  }

  return (
    <Tag className={cn("text-lg font-semibold", className)}>
      {!shortVersion && (
        <>
          Will
          <span className="dark:text-secondary bg-primary p-1 rounded mx-1">
            {tradingPair.one}/{tradingPair.two}
          </span>
          go up or down within {toHuman(diff)}?
        </>
      )}
      {shortVersion && (
        <div className="flex">
          <Link
            className="dark:text-secondary bg-primary px-1 rounded mx-1 hover:underline"
            href={titleLinkHref ?? ""}
          >
            {tradingPair.one}/{tradingPair.two}
          </Link>
          {showTime && (
            <div className="hidden sm:flex items-center">
              <TrendingUpDown className="pr-2 dark:text-neutral-400" />
              <span className="font-normal dark:text-neutral-400 text-sm truncate">
                {toHuman(diff)}
              </span>
            </div>
          )}
        </div>
      )}
    </Tag>
  );
};
