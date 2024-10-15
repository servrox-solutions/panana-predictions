"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResolvedMarket, ResolvedMarketsTable } from "./resolved-markets-table";
import { CreatedMarket, CreatedMarketsTable } from "./created-markets-table";
import { useState } from "react";
import { DateTime } from "luxon";
import { MarketType } from "@/lib/types/market";
import { Web3AmountCard } from "../web3-amount-card";
import { useIsMounted } from "@/lib/hooks/useIsMounted";
import { MarketFilterDropdown } from '../market/market-filter-dropdown';

export interface DashboardContentProps {
  latestCreatedMarkets: CreatedMarket[];
  latestResolvedMarkets: ResolvedMarket[];
  totalVolume: {
    usd: number;
    apt: number;
  };
  openMarkets: { [key in MarketType]: number };
  searchParams: { [key: string]: string | string[] | undefined };
}

export function DashboardContent({
  latestCreatedMarkets,
  latestResolvedMarkets,
  totalVolume,
  searchParams,
  openMarkets,
}: DashboardContentProps) {
  const isMounted = useIsMounted();

  const urlSearchParams = new URLSearchParams(
    Object.entries(searchParams).flatMap(([key, value]) =>
      value === undefined
        ? []
        : Array.isArray(value)
          ? value.map((v) => [key, v])
          : [[key, value]]
    )
  );
  const pathname = usePathname();
  const router = useRouter();

  const [filter, setFilter] = useState<MarketType[]>(
    (urlSearchParams.get("dashboard")?.split(",") as MarketType[]) ?? []
  );

  const filterNetworks: MarketType[] = Array.from(
    new Set([
      ...latestCreatedMarkets.map((x) => x.assetSymbol),
      ...latestResolvedMarkets.map((x) => x.assetSymbol),
    ])
  ).sort((x, y) => x.localeCompare(y));

  const setQuery = (q: string, value: string) => {
    const current = new URLSearchParams(Array.from(urlSearchParams.entries()));

    if (!value) {
      current.delete(q);
    } else {
      current.set(q, value);
    }

    // cast to string
    const search = current.toString();
    // or const query = `${'?'.repeat(search.length && 1)}${search}`;
    const query = search ? `?${search}` : "";

    router.push(`${pathname}${query}`, { scroll: false });
  };

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          <Web3AmountCard
            className="col-span-2 lg:col-span-1"
            title="Open Markets"
            assetCounts={openMarkets}
          />
          <Card
            className="col-span-2 lg:col-span-1"
            x-chunk="dashboard-05-chunk-1"
          >
            <CardHeader className="pb-2">
              <CardDescription>Total Volume (all assets)</CardDescription>
              <CardTitle className="text-4xl">
                {isMounted ? `$ ${totalVolume.usd.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}` : "..."}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                ({totalVolume.apt} APT)
              </div>
            </CardContent>
          </Card>
          <Card
            className="col-span-2 hidden md:block lg:col-span-1"
            x-chunk="dashboard-05-chunk-1"
          >
            <CardHeader className="pb-2">
              <CardDescription>Volume last 10 Markets</CardDescription>
              <CardTitle className="text-4xl">
                ${" "}
                {latestResolvedMarkets
                  .slice(0, 10)
                  .reduce((prev, cur) => (prev += cur.marketCap.usd), 0).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                (
                {latestResolvedMarkets
                  .slice(0, 10)
                  .reduce((prev, cur) => (prev += cur.marketCap.asset), 0)}{" "}
                APT)
              </div>
            </CardContent>
          </Card>
          <Card
            className="col-span-2 hidden md:block lg:col-span-1"
            x-chunk="dashboard-05-chunk-1"
          >
            <CardHeader className="pb-2">
              <CardDescription>Markets resolved last hour</CardDescription>
              <CardTitle className="text-4xl">
                {
                  latestResolvedMarkets.filter(
                    (x) =>
                      +x.endTimeTimestamp >=
                      DateTime.now().minus({ hours: 1 }).toSeconds()
                  ).length
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                (
                {latestResolvedMarkets
                  .filter(
                    (x) =>
                      +x.endTimeTimestamp >=
                      DateTime.now().minus({ hours: 1 }).toSeconds()
                  )
                  .reduce((prev, cur) => (prev += cur.marketCap.asset), 0)}{" "}
                APT)
              </div>
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue={urlSearchParams.get("nav") || "resolvedMarkets"}>
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger
                value="resolvedMarkets"
                onClick={() => setQuery("nav", "resolvedMarkets")}
              >
                Resolved Markets
              </TabsTrigger>
              <TabsTrigger
                value="createdMarkets"
                onClick={() => setQuery("nav", "createdMarkets")}
              >
                New Markets
              </TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
              <MarketFilterDropdown
                name="dashboard"
                items={filterNetworks}
                preSelected={searchParams?.filter}
                onFilterChange={(filter) => setFilter(filter)}
              />
            </div>
          </div>
          <TabsContent value="resolvedMarkets">
            <Card x-chunk="dashboard-05-chunk-3">
              <CardHeader className="px-7">
                <CardTitle>Resolved Markets</CardTitle>
                <CardDescription>Recently resolved markets</CardDescription>
              </CardHeader>
              <CardContent>
                <ResolvedMarketsTable
                  filter={filter}
                  latestResolvedMarkets={latestResolvedMarkets}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="createdMarkets">
            <Card x-chunk="dashboard-05-chunk-3">
              <CardHeader className="px-7">
                <CardTitle>New Markets</CardTitle>
                <CardDescription>Recently created markets</CardDescription>
              </CardHeader>
              <CardContent>
                <CreatedMarketsTable
                  filter={filter}
                  latestCreatedMarkets={latestCreatedMarkets}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
