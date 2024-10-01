"use client";

import {
  PartyPopper,
  Lock,
  Coins,
  Store,
  Banana,
  User,
  ChartNoAxesColumn,
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
import { getExplorerObjectLink } from "@/lib/aptos";
import { Web3Icon } from "./web3-icon";
import { useIsMounted } from "@/lib/hooks/useIsMounted";
import { MarketType } from "@/lib/types/market";
import { cn } from "@/lib/utils";

export interface CreatedMarket {
  assetSymbol: MarketType;
  createdAtTimestamp: number;
  endTimeTimestamp: number;
  startTimeTimestamp: number;
  marketAddress: string;
  marketplaceAddress: string;
  minBet: number;
  creator: string;
}

export interface CreatedMarketsTableProps {
  latestCreatedMarkets: CreatedMarket[];
  filter: MarketType[];
}

export function CreatedMarketsTable({
  latestCreatedMarkets,
  filter = [],
}: CreatedMarketsTableProps) {
  const isMounted = useIsMounted();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden sm:table-cell">Asset</TableHead>
          <TableHead className="hidden sm:table-cell">Min Bet</TableHead>
          <TableHead className="hidden sm:table-cell">Created At</TableHead>
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
        <div>
          <TableRow
            className={cn(
              "table-row hover:sm:bg-gray-500 hover:sm:bg-opacity-50",
              latestCreatedMarkets.filter((latestCreatedMarket) =>
                filter.length === 0
                  ? true
                  : filter.includes(latestCreatedMarket.assetSymbol)
              ).length === 0
                ? ""
                : "hidden"
            )}
            key="empty table"
          >
            <TableCell className="table-cell text-center" colSpan={8}>
              <span className="p-4">No Values</span>
            </TableCell>
          </TableRow>
        </div>
        {latestCreatedMarkets.map((latestCreatedMarket) => (
          <Link
            className={cn(
              "hover:bg-initial hover:sm:bg-gray-500 hover:sm:bg-opacity-50 table-row",
              filter.length === 0 ||
                filter.includes(latestCreatedMarket.assetSymbol)
                ? ""
                : "hidden"
            )}
            key={latestCreatedMarket.marketAddress}
            href={`/markets/${latestCreatedMarket.marketAddress}`}
          >
            <TableCell className="hidden sm:table-cell">
              <div className="h-full">
                <div className="text-md text-muted-foreground flex justify-center align-center gap-2">
                  <Web3Icon
                    className="scale-[2]"
                    asset={latestCreatedMarket.assetSymbol}
                  />
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <div className="flex items-center">
                <Coins className="h-4 w-4 mr-2" />
                <div className="flex flex-col">
                  <div className="flex gap-2">
                    {latestCreatedMarket.minBet / 10 ** 8}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <div className="flex items-center">
                <Banana className="h-4 w-4 mr-2" />
                <div className="flex flex-col">
                  <span>
                    {isMounted &&
                      DateTime.fromSeconds(
                        latestCreatedMarket.createdAtTimestamp
                      ).toLocaleString(DateTime.DATETIME_MED)}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              <div className="flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                <div className="flex flex-col">
                  <span>
                    {isMounted &&
                      DateTime.fromSeconds(
                        latestCreatedMarket.startTimeTimestamp
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
                    {DateTime.fromSeconds(
                      latestCreatedMarket.endTimeTimestamp
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
                        latestCreatedMarket.creator,
                        true
                      )}
                    >
                      {latestCreatedMarket.marketplaceAddress}
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
                        latestCreatedMarket.marketAddress,
                        true
                      )}
                    >
                      {latestCreatedMarket.marketAddress}
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
                        latestCreatedMarket.marketplaceAddress,
                        true
                      )}
                    >
                      {latestCreatedMarket.marketplaceAddress}
                    </Link>
                  </p>
                </div>
              </div>
            </TableCell>

            <TableCell className="sm:hidden px-0">
              <div className="flex gap-2 text-xl pb-4 items-center">
                <Web3Icon
                  asset={latestCreatedMarket.assetSymbol}
                  className="w-8 h-8"
                />{" "}
                {latestCreatedMarket.assetSymbol}
              </div>
              <div className="grid grid-cols-2 grid-rows auto-rows-fr gap-4">
                <div className="flex items-center">
                  <Coins className="h-4 w-4 mr-4" />
                  <div className="flex flex-col">
                    <span className="text-neutral-700 dark:text-neutral-300 text-xs">
                      Min Bet
                    </span>
                    <div className="flex w-full">
                      {latestCreatedMarket.minBet / 10 ** 8}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Banana className="h-4 w-4 mr-4" />
                  <div className="flex flex-col">
                    <span className="text-neutral-700 dark:text-neutral-300 text-xs">
                      Created At
                    </span>
                    <span>
                      <div className="flex items-center w-full relative">
                        {isMounted &&
                          DateTime.fromSeconds(
                            latestCreatedMarket.createdAtTimestamp
                          ).toLocaleString(DateTime.DATETIME_MED)}
                      </div>
                    </span>
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
                              latestCreatedMarket.startTimeTimestamp
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
                              latestCreatedMarket.endTimeTimestamp
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
