"use client";

import {
  PartyPopper,
  Lock,
  DollarSign,
  Store,
  ChevronsUp,
  ChevronsDown,
  User,
  ChartNoAxesColumn,
  ChevronsLeftRight,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { DateTime } from "luxon";
import { getExplorerObjectLink, octasToApt } from "@/lib/aptos";
import { Web3Icon } from "../web3-icon";
import { useIsMounted } from "@/lib/hooks/useIsMounted";
import { MarketType } from "@/lib/types/market";
import { convertSmallestUnitToFullUnit } from '@/lib/utils';

export interface ResolvedMarket {
  assetSymbol: MarketType;
  endTimeTimestamp: number;
  startTimeTimestamp: number;
  marketAddress: string;
  marketplaceAddress: string;
  creator: string;
  startPrice: number;
  endPrice: number;
  marketCap: {
    asset: number;
    usd: number;
  };
  dissolved: boolean;
}

export interface ResolvedMarketsTable {
  latestResolvedMarkets: ResolvedMarket[];
  filter: MarketType[];
}

export function ResolvedMarketsTable({
  latestResolvedMarkets,
  filter = [],
}: ResolvedMarketsTable) {
  const isMounted = useIsMounted();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden sm:table-cell">Asset</TableHead>
          <TableHead className="hidden sm:table-cell">
            Final Price Pool
          </TableHead>
          <TableHead className="hidden sm:table-cell">Result</TableHead>
          <TableHead className="hidden lg:table-cell">End Betting</TableHead>
          <TableHead className="hidden sm:table-cell">
            Market Resolution
          </TableHead>
          <TableHead className="hidden 2xl:table-cell">Creator</TableHead>
          <TableHead className="hidden 2xl:table-cell">Market</TableHead>
          <TableHead className="hidden 2xl:table-cell">Marketplace</TableHead>
          {/* <TableHead className=" sm:hidden">
            Market Information
          </TableHead> */}
          {/*<TableHead className="lg:hidden"> // 2xl:table-cell
            Addresses
          </TableHead> */}
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          className={`table-row hover:bg-initial hover:sm:bg-gray-500 hover:sm:bg-opacity-50 ${latestResolvedMarkets.filter((latestResolvedMarket) =>
            filter.length === 0
              ? true
              : filter.includes(latestResolvedMarket.assetSymbol)
          ).length === 0
            ? ""
            : "hidden"
            }`}
          key="empty table"
        >
          <TableCell className="table-cell text-center" colSpan={8}>
            <span className="p-4">No Values</span>
          </TableCell>
        </TableRow>
        {latestResolvedMarkets.map((latestResolvedMarket, idx) => (
          <Link className={`hover:bg-initial hover:sm:bg-gray-500 table-row hover:sm:bg-opacity-50 ${filter.length === 0 ||
            filter.includes(latestResolvedMarket.assetSymbol)
            ? ""
            : "hidden"
            }`}
            key={latestResolvedMarket.marketAddress}
            href={`/markets/${latestResolvedMarket.marketAddress}`}>
            <TableCell className="hidden sm:table-cell">
              <div
                className={`h-full ${idx !== 3 && idx !== 5 ? `text-positive-1` : "text-negative-1"
                  }`}
              >
                <div className="text-md text-muted-foreground flex justify-center align-center gap-2">
                  <Web3Icon
                    className="scale-[2]"
                    asset={latestResolvedMarket.assetSymbol}
                  />
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                <div className="flex flex-col">
                  <div className="flex gap-2">
                    <span>{latestResolvedMarket.marketCap.usd.toFixed(2)}</span>
                    <span className="text-muted-foreground">
                      ({latestResolvedMarket.marketCap.asset.toFixed(4)} APT)
                    </span>
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <div
                className={`flex items-center w-full font-semibold ${latestResolvedMarket.startPrice <
                  latestResolvedMarket.endPrice
                  ? `text-positive-1`
                  : "text-negative-1"
                  } relative`}
              >
                {latestResolvedMarket.startPrice.toFixed(3)} ${" "}
                {latestResolvedMarket.startPrice ===
                  latestResolvedMarket.endPrice ? (
                  <ChevronsLeftRight />
                ) : latestResolvedMarket.startPrice <
                  latestResolvedMarket.endPrice ? (
                  <ChevronsUp />
                ) : (
                  <ChevronsDown />
                )}{" "}
                {latestResolvedMarket.endPrice.toFixed(3)} $
              </div>
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              <div className="flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                <div className="flex flex-col">
                  <span>
                    {isMounted &&
                      DateTime.fromSeconds(
                        latestResolvedMarket.startTimeTimestamp
                      ).toLocaleString(DateTime.DATETIME_MED)}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <div className="flex items-center">
                <PartyPopper className="h-4 w-4 mr-2" />
                <div className="flex flex-col">
                  <span>
                    {isMounted &&
                      DateTime.fromSeconds(
                        latestResolvedMarket.endTimeTimestamp
                      ).toLocaleString(DateTime.DATETIME_MED)}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden 2xl:table-cell">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <div className="flex flex-col max-w-[150px]">
                  <p className="text-ellipsis overflow-hidden">
                    <Link
                      className="underline"
                      target="_blank"
                      href={getExplorerObjectLink(
                        latestResolvedMarket.creator,
                        true
                      )}
                    >
                      {latestResolvedMarket.creator}
                    </Link>
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden 2xl:table-cell">
              <div className="flex items-center">
                <ChartNoAxesColumn className="h-4 w-4 mr-2" />
                <div className="flex flex-col max-w-[150px]">
                  <p className="text-ellipsis overflow-hidden">
                    <Link
                      className="underline"
                      target="_blank"
                      href={getExplorerObjectLink(
                        latestResolvedMarket.marketAddress,
                        true
                      )}
                    >
                      {latestResolvedMarket.marketAddress}
                    </Link>
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden 2xl:table-cell">
              <div className="flex items-center">
                <Store className="h-4 w-4 mr-2" />
                <div className="flex flex-col max-w-[150px]">
                  <p className="text-ellipsis overflow-hidden">
                    <Link
                      className="underline"
                      target="_blank"
                      href={getExplorerObjectLink(
                        latestResolvedMarket.marketplaceAddress,
                        true
                      )}
                    >
                      {latestResolvedMarket.marketplaceAddress}
                    </Link>
                  </p>
                </div>
              </div>
            </TableCell>

            <TableCell className="sm:hidden px-0">
              <div className="flex gap-2 text-xl pb-4 items-center">
                <Web3Icon
                  asset={latestResolvedMarket.assetSymbol}
                  className="w-8 h-8"
                />{" "}
                {latestResolvedMarket.assetSymbol}
              </div>
              <div className="grid grid-cols-2 grid-rows auto-rows-fr gap-4">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-4" />
                  <div className="flex flex-col">
                    <span className="text-neutral-700 dark:text-neutral-300 text-xs">
                      Final Price Pool
                    </span>
                    <div className="flex flex-col w-full">
                      <span>
                        {latestResolvedMarket.marketCap.usd.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground">
                        ({latestResolvedMarket.marketCap.asset.toFixed(2)} APT)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  {latestResolvedMarket.startPrice ===
                    latestResolvedMarket.endPrice ? (
                    <ChevronsLeftRight className="w-4 h-4 mr-4" />
                  ) : latestResolvedMarket.startPrice <
                    latestResolvedMarket.endPrice ? (
                    <ChevronsUp className="h-4 w-4 mr-4" />
                  ) : (
                    <ChevronsDown className="h-4 w-4 mr-4" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-neutral-700 dark:text-neutral-300 text-xs">
                      Result
                    </span>
                    <div className="flex">
                      <div
                        className={`flex flex-col items-center w-full font-semibold relative ${latestResolvedMarket.startPrice <
                          latestResolvedMarket.endPrice
                          ? "text-positive-1"
                          : "text-negative-1"
                          }`}
                      >
                        <div>
                          {latestResolvedMarket.startPrice.toFixed(3)}{" "}
                          $
                        </div>
                        <div>
                          {latestResolvedMarket.endPrice.toFixed(3)}{" "}
                          $
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 mr-4" />
                    <div className="flex flex-col">
                      <span className="text-neutral-700 dark:text-neutral-300 text-xs">
                        End Bet
                      </span>
                      <div className="flex flex-col">
                        <span>
                          {isMounted &&
                            DateTime.fromSeconds(
                              latestResolvedMarket.startTimeTimestamp
                            ).toLocaleString(DateTime.DATETIME_MED)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <PartyPopper className="h-4 w-4 mr-4" />
                    <div className="flex flex-col">
                      <span className="text-neutral-700 dark:text-neutral-300 text-xs">
                        Market Resolution
                      </span>
                      <div className="flex flex-col">
                        <span>
                          {isMounted &&
                            DateTime.fromSeconds(
                              latestResolvedMarket.endTimeTimestamp
                            ).toLocaleString(DateTime.DATETIME_MED)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TableCell>
          </Link>
        ))}
      </TableBody>
    </Table>
  );
}
