import { cn } from "@/lib/utils";
import { DateTime, Duration } from "luxon";

export interface MarketTitleProps {
  tradingPair: {
    one: string;
    two: string;
  };
  resolveTime: number;
  betCloseTime: number;
  as?: any;
  className?: string;
}

export const MarketTitle = ({
  tradingPair,
  resolveTime,
  betCloseTime,
  as: Tag = "h2",
  className,
}: MarketTitleProps) => {
  const diff = DateTime.fromSeconds(resolveTime).diff(DateTime.fromSeconds(betCloseTime));

  // Got function from here: https://github.com/moment/luxon/issues/1134
  function toHuman(dur: Duration, smallestUnit = "seconds"): string {
    const units = ["years", "months", "days", "hours", "minutes", "seconds", "milliseconds",];
    const smallestIdx = units.indexOf(smallestUnit);
    const entries = Object.entries(
      dur.shiftTo(...(units as any)).normalize().toObject()
    ).filter(([_unit, amount], idx) => amount > 0 && idx <= smallestIdx);
    const dur2 = Duration.fromObject(
      entries.length === 0 ? { [smallestUnit]: 0 } : Object.fromEntries(entries)
    );
    return dur2.reconfigure({ locale: 'en-GB' }).toHuman();
  }

  return (
    <Tag className={cn("text-lg font-semibold", className)}>
      Will
      <span className="text-secondary bg-primary p-1 rounded mx-1">
        {tradingPair.one}/{tradingPair.two}
      </span>
      go up or down within {toHuman(diff)}?
    </Tag>
  );
};
