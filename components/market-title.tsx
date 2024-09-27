import { cn } from "@/lib/utils";
import { DateTime } from "luxon";

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
  return (
    <Tag className={cn("text-lg font-semibold", className)}>
      Will
      <span className="text-secondary bg-primary p-1 rounded mx-1">
        {tradingPair.one}/{tradingPair.two}
      </span>
      go up or down within{" "}
      {DateTime.fromSeconds(resolveTime)
        .diff(DateTime.fromSeconds(betCloseTime))
        .toFormat("hh:mm:ss")}{" "}
      hours?
    </Tag>
  );
};
