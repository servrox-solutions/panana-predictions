"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Web3Icon } from "./web3-icon";
import { MarketType } from "@/lib/types/market";
import { cn } from "@/lib/utils";

export interface Web3AmountCardProps {
  title: string;
  assetCounts: { [key in MarketType]: number };
  className?: string;
}

export function Web3AmountCard({
  assetCounts,
  className,
  title,
}: Web3AmountCardProps) {
  return (
    <Card className={className} x-chunk="dashboard-05-chunk-2">
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-xl font-normal">
          <div className="grid gap-4 grid-cols-5">
            {Object.entries(assetCounts)
              .sort((x, y) => x[0].localeCompare(y[0]))
              .map(([asset, amount]) => (
                <div
                  key={asset}
                  className={cn(
                    "flex items-center",
                    amount === 0 && "opacity-50"
                  )}
                >
                  {amount}
                  <span className="text-xs pr-1">&times;</span>
                  <Web3Icon
                    className="w-8 h-8 min-w-4"
                    asset={asset as MarketType}
                  />
                </div>
              ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">
          Total:{" "}
          {Object.values(assetCounts).reduce((prev, cur) => prev + cur, 0)}
        </div>
      </CardContent>
    </Card>
  );
}
