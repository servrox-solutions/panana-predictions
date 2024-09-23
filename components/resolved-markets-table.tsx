"use client";

import {
  PartyPopper,
  Lock,
  DollarSign,
  Store,
  ChevronsUp,
  TrendingUpDown,
  ChevronsDown,
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
import { DateTime } from 'luxon';
import {
  NetworkAptos,
} from "@web3icons/react";
import { getExplorerObjectLink } from '@/lib/aptos';
import { Web3Icon } from './web3-icon';
import { SupportedAsset } from '@/lib/types/market';


export interface ResolvedMarket {
  assetSymbol: SupportedAsset,
  endTimeTimestamp: number,
  startTimeTimestamp: number,
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
}

export function ResolvedMarketsTable(props: ResolvedMarketsTable) {
  const { latestResolvedMarkets } = props;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden sm:table-cell">
            Asset
          </TableHead>
          <TableHead className="hidden sm:table-cell">
            Final Price Pool
          </TableHead>
          <TableHead className="hidden sm:table-cell">
            Result
          </TableHead>
          <TableHead className="hidden lg:table-cell">
            End Betting
          </TableHead>
          <TableHead className="hidden sm:table-cell">
            Market Resolution
          </TableHead>
          <TableHead className="hidden 2xl:table-cell">
            Creator
          </TableHead>
          <TableHead className="hidden 2xl:table-cell">
            Market
          </TableHead>
          <TableHead className="hidden 2xl:table-cell">
            Marketplace
          </TableHead>
          {/* <TableHead className=" sm:hidden">
            Market Information
          </TableHead> */}
          {/*<TableHead className="lg:hidden"> // 2xl:table-cell
            Addresses
          </TableHead> */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {
          latestResolvedMarkets.map((latestResolvedMarket, idx) => (
            <TableRow className="hover:bg-initial" key={latestResolvedMarket.marketAddress}>
              <TableCell className="hidden sm:table-cell">
                <div className={`h-full ${idx !== 3 && idx !== 5 ? `text-green-600/90 hover:text-green-500/10` : 'text-red-600/90  hover:text-red-500/10'}`}>
                  <div className="text-md text-muted-foreground flex justify-center align-center gap-2">
                    <Web3Icon asset={latestResolvedMarket.assetSymbol} />
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <div className="flex flex-col">
                    <div className="flex gap-2">
                      <span>{latestResolvedMarket.marketCap.usd}</span><span className="text-muted-foreground">
                        ({latestResolvedMarket.marketCap.asset} APT)
                      </span>
                    </div>
                  </div>
                </div>

              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className={`flex items-center w-full font-semibold ${latestResolvedMarket.startPrice < latestResolvedMarket.endPrice ? 'text-green-600/70 hover:text-green-500' : 'text-red-600/70 hover:text-red-500'} relative`}>
                  {latestResolvedMarket.startPrice / 10 ** 9} $ {latestResolvedMarket.startPrice === latestResolvedMarket.endPrice ? '=' : latestResolvedMarket.startPrice < latestResolvedMarket.endPrice ? <ChevronsUp /> : <ChevronsDown />} {latestResolvedMarket.endPrice / 10 ** 9}$
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  <div className="flex flex-col">
                    <span>
                      {DateTime.fromSeconds(latestResolvedMarket.startTimeTimestamp).toLocaleString(DateTime.DATETIME_MED)}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="flex items-center">
                  <PartyPopper className="h-4 w-4 mr-2" />
                  <div className="flex flex-col">
                    <span>
                      {DateTime.fromSeconds(latestResolvedMarket.endTimeTimestamp).toLocaleString(DateTime.DATETIME_MED)}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden 2xl:table-cell">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <div className="flex flex-col max-w-[150px]">
                    <p className="text-ellipsis overflow-hidden">
                      <Link className="underline" target='_blank' href={getExplorerObjectLink(latestResolvedMarket.creator, true)}>
                        {latestResolvedMarket.marketplaceAddress}
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
                      <Link className="underline" target='_blank' href={getExplorerObjectLink(latestResolvedMarket.marketAddress, true)}>
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
                      <Link className="underline" target='_blank' href={getExplorerObjectLink(latestResolvedMarket.marketplaceAddress, true)}>
                        {latestResolvedMarket.marketplaceAddress}
                      </Link>
                    </p>
                  </div>
                </div>
              </TableCell>



              <TableCell className="sm:hidden px-0">
                <div className="flex gap-2 text-xl pb-4 items-center"><NetworkAptos className="" /> APT / BTC </div>
                <div className="grid grid-cols-2 grid-rows auto-rows-fr gap-4">

                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-4" />
                    <div className="flex flex-col">
                      <span className="text-neutral-700 dark:text-neutral-300 text-xs">
                        Final Price Pool
                      </span>
                      <div className="flex w-full">
                        <span>{latestResolvedMarket.marketCap.usd}</span>&nbsp;<span className="text-muted-foreground">
                          ({latestResolvedMarket.marketCap.asset} APT)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <TrendingUpDown className="h-4 w-4 mr-4" />
                    <div className="flex flex-col">
                      <span className="text-neutral-700 dark:text-neutral-300 text-xs">
                        Result
                      </span>
                      <span>
                        <div className={`flex items-center w-full font-semibold ${latestResolvedMarket.startPrice < latestResolvedMarket.endPrice ? 'text-green-600/70 hover:text-green-500' : 'text-red-600/70 hover:text-red-500'} relative`}>
                          {latestResolvedMarket.startPrice / 10 ** 9} $ {latestResolvedMarket.startPrice === latestResolvedMarket.endPrice ? '=' : latestResolvedMarket.startPrice < latestResolvedMarket.endPrice ? <ChevronsUp /> : <ChevronsDown />} {latestResolvedMarket.endPrice / 10 ** 9}$
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
                            {DateTime.fromSeconds(latestResolvedMarket.startTimeTimestamp).toLocaleString(DateTime.DATETIME_MED)}
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
                            {DateTime.fromSeconds(latestResolvedMarket.endTimeTimestamp).toLocaleString(DateTime.DATETIME_MED)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </TableCell>
            </TableRow>
          )
          )
        }
      </TableBody>
    </Table >
  );
}
