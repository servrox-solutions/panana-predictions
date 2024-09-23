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
import { DateTime } from 'luxon';
import {
  NetworkAptos, NetworkBitcoin, NetworkEthereum, NetworkSolana, TokenUSDC,
} from "@web3icons/react";
import { getExplorerObjectLink } from '@/lib/aptos';
import { SupportedAsset } from '@/lib/types/market';
import { Web3Icon } from './web3-icon';


export interface CreatedMarket {
  assetSymbol: SupportedAsset,
  createdAtTimestamp: number,
  endTimeTimestamp: number,
  startTimeTimestamp: number,
  marketAddress: string;
  marketplaceAddress: string;
  minBet: number;
  creator: string;
}

export type Filter = SupportedAsset | 'No Filter';
export interface CreatedMarketsTableProps {
  latestCreatedMarkets: CreatedMarket[];
  filter: Filter;
}

export function CreatedMarketsTable(props: CreatedMarketsTableProps) {
  const { latestCreatedMarkets, filter } = props;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden sm:table-cell">
            Asset
          </TableHead>
          <TableHead className="hidden sm:table-cell">
            Min Bet
          </TableHead>
          <TableHead className="hidden sm:table-cell">
            Created At
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
          latestCreatedMarkets.map((latestCreatedMarket, idx) => (
            <TableRow className={`hover:bg-initial ${filter === 'No Filter' || filter === latestCreatedMarket.assetSymbol ? '' : 'hidden'}`} key={latestCreatedMarket.marketAddress}>
              <TableCell className="hidden sm:table-cell">
                <div className={`h-full`}>
                  <div className="text-md text-muted-foreground flex justify-center align-center gap-2">
                    <Web3Icon asset={latestCreatedMarket.assetSymbol} />
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
                      {DateTime.fromSeconds(latestCreatedMarket.createdAtTimestamp).toLocaleString(DateTime.DATETIME_MED)}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  <div className="flex flex-col">
                    <span>
                      {DateTime.fromSeconds(latestCreatedMarket.startTimeTimestamp).toLocaleString(DateTime.DATETIME_MED)}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="flex items-center">
                  <PartyPopper className="h-4 w-4 mr-2" />
                  <div className="flex flex-col">
                    <span>
                      {DateTime.fromSeconds(latestCreatedMarket.endTimeTimestamp).toLocaleString(DateTime.DATETIME_MED)}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden 2xl:table-cell">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <div className="flex flex-col max-w-[150px]">
                    <p className="text-ellipsis overflow-hidden">
                      <Link className="underline" target='_blank' href={getExplorerObjectLink(latestCreatedMarket.creator, true)}>
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
                      <Link className="underline" target='_blank' href={getExplorerObjectLink(latestCreatedMarket.marketAddress, true)}>
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
                      <Link className="underline" target='_blank' href={getExplorerObjectLink(latestCreatedMarket.marketplaceAddress, true)}>
                        {latestCreatedMarket.marketplaceAddress}
                      </Link>
                    </p>
                  </div>
                </div>
              </TableCell>



              <TableCell className="sm:hidden px-0">
                <div className="flex gap-2 text-xl pb-4 items-center"><NetworkAptos className="" /> APT / BTC </div>
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
                        <div className={`flex items-center w-full relative`}>
                          {DateTime.fromSeconds(latestCreatedMarket.createdAtTimestamp).toLocaleString(DateTime.DATETIME_MED)}
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
                            {DateTime.fromSeconds(latestCreatedMarket.startTimeTimestamp).toLocaleString(DateTime.DATETIME_MED)}
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
                            {DateTime.fromSeconds(latestCreatedMarket.endTimeTimestamp).toLocaleString(DateTime.DATETIME_MED)}
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
