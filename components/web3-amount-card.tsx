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
        <CardTitle className="text-4xl">
          <div className="grid grid-cols-3 gap-4 2xl:grid-cols-5">
            {Object.entries(assetCounts)
              .sort((x, y) => x[0].localeCompare(y[0]))
              .map(([asset, amount]) => (
                <div key={asset} className="flex items-center gap-1">
                  {amount}{" "}
                  <Web3Icon className="w-8 h-8" asset={asset as MarketType} />
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
