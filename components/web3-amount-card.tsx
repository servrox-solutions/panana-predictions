"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { SupportedAsset } from "@/lib/types/market";
import { Web3Icon } from "./web3-icon";
import { cn } from '@/lib/utils';

export interface Web3AmountCardProps {
  title: string;
  assetCounts: { [key in SupportedAsset]: number };
  className?: string;
}

export function Web3AmountCard({
  assetCounts,
  className,
  title,
}: Web3AmountCardProps) {


  return (
    <Card
      className={className}
      x-chunk="dashboard-05-chunk-2"
    >
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-4xl">
          <div className="flex gap-6 flex-wrap">
            {Object.entries(assetCounts).sort((x, y) => x[0].localeCompare(y[0])).map(([asset, amount]) => (
              <div className="flex items-center gap-1">
                {amount}{" "}
                <Web3Icon
                  className="w-8 h-8"
                  asset={asset as SupportedAsset}
                />
              </div>
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">
          Total:{" "}
          {Object.values(assetCounts).reduce(
            (prev, cur) => prev + cur,
            0
          )}
        </div>
      </CardContent>
    </Card>
  );
}
