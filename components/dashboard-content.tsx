"use client";

import {
  ListFilter,
  PartyPopper,
  Lock,
  Coins,
  DollarSign,
  Store,
  ChartNoAxesColumn,
} from "lucide-react";


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { DateTime } from 'luxon';
import {
  NetworkAptos,
} from "@web3icons/react";
import { getExplorerObjectLink } from '@/lib/aptos';
import { ResolvedMarket, ResolvedMarketsTable } from './resolved-markets-table';


export interface CreatedMarket {
  endTimeTimestamp: number,
  startTimeTimestamp: number,
  marketAddress: string;
  marketplaceAddress: string;
}

export interface DashboardContentProps {
  latestCreatedMarkets: CreatedMarket[];
  latestResolvedMarkets: ResolvedMarket[];
}

export function DashboardContent(props: DashboardContentProps) {
  const { latestCreatedMarkets, latestResolvedMarkets } = props;

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
        <div className="lg:grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 hidden">
          <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
            <CardHeader className="pb-3">
              <CardTitle>All Markets</CardTitle>
              <CardDescription className="max-w-lg text-balance leading-relaxed">
                You can also create your own market to predict the future price of an asset.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/markets">
                <Button className='capitalize'>Create new market</Button>
              </Link>
            </CardFooter>
          </Card>
          <Card x-chunk="dashboard-05-chunk-1">
            <CardHeader className="pb-2">
              <CardDescription>Total Volume (all assets)</CardDescription>
              <CardTitle className="text-4xl">$1,2 mio.</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                (25123 APT)
              </div>
            </CardContent>
            {/* <CardFooter>
              <Progress value={25} aria-label="25% increase" />
            </CardFooter> */}
          </Card>
          <Card x-chunk="dashboard-05-chunk-2">
            <CardHeader className="pb-2">
              <CardDescription>Last 7 Days</CardDescription>
              <CardTitle className="text-4xl">$35,329</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                (2345 APT)
              </div>
            </CardContent>
            {/* <CardFooter>
              <Progress value={12} aria-label="12% increase" />
            </CardFooter> */}
          </Card>
        </div>
        <Tabs defaultValue="resolvedMarkets">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="resolvedMarkets">Resolved Markets</TabsTrigger>
              <TabsTrigger value="createdMarkets">New Markets</TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-sm"
                  >
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked>
                    APT
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>BTC</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>ETH</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>SOL</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <TabsContent value="resolvedMarkets">
            <Card x-chunk="dashboard-05-chunk-3">
              <CardHeader className="px-7">
                <CardTitle>Resolved Markets</CardTitle>
                <CardDescription>
                  Recently resolved markets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResolvedMarketsTable latestResolvedMarkets={latestResolvedMarkets} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="createdMarkets">
            <Card x-chunk="dashboard-05-chunk-3">
              <CardHeader className="px-7">
                <CardTitle>New Markets</CardTitle>
                <CardDescription>
                  Recently created markets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        Assetpair
                      </TableHead>
                      <TableHead>
                        Market Information
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Addresses
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {
                      latestCreatedMarkets.map(latestCreatedMarket => (
                        <TableRow key={latestCreatedMarket.marketAddress}>
                          <TableCell className="flex-grow h-full text-center">
                            <div className="h-full">
                              <div className="font-medium text-xs mb-1 md:flex justify-center align-center">APT/USD</div>
                              <div className="text-md text-muted-foreground flex justify-center align-center">
                                <NetworkAptos className='scale-125' />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="flex-grow flex-shrink-0">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center">
                                <Lock className="h-4 w-4 mx-4" />
                                <div className="flex flex-col">
                                  <span className="text-neutral-700 dark:text-neutral-300 text-xs">
                                    End betting:
                                  </span>
                                  <span>
                                    {DateTime.fromSeconds(latestCreatedMarket.startTimeTimestamp).toLocaleString(DateTime.DATETIME_MED)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <PartyPopper className="h-4 w-4 mx-4" />
                                <div className="flex flex-col">
                                  <span className="text-neutral-700 dark:text-neutral-300 text-xs">
                                    Market resolution:
                                  </span>
                                  <span>
                                    {DateTime.fromSeconds(latestCreatedMarket.endTimeTimestamp).toLocaleString(DateTime.DATETIME_MED)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <Coins className="h-4 w-4 mx-4" />
                                <div className="flex flex-col">
                                  <span className="text-neutral-700 dark:text-neutral-300 text-xs">
                                    Min Bet:
                                  </span>
                                  <p className="text-ellipsis overflow-hidden">
                                    <span>$ 0.5 </span><span className="text-muted-foreground">
                                      (0.08 APT)
                                    </span>
                                    {/* {latestCreatedMarket.minBet} */}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell flex-grow max-w-[150px]">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center">
                                <ChartNoAxesColumn className="h-4 w-4 mx-4" />
                                <div className="flex flex-col max-w-[150px]">
                                  <span className="text-neutral-700 dark:text-neutral-300 text-xs">
                                    Market:
                                  </span>
                                  <p className="text-ellipsis overflow-hidden">
                                    <Link className="underline" target='_blank' href={getExplorerObjectLink(latestCreatedMarket.marketAddress, true)}>
                                      {latestCreatedMarket.marketAddress}
                                    </Link>
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <Store className="h-4 w-4 mx-4" />
                                <div className="flex flex-col max-w-[150px]">
                                  <span className="text-neutral-700 dark:text-neutral-300 text-xs">
                                    Marketplace:
                                  </span>
                                  <p className="text-ellipsis overflow-hidden">
                                    <Link className="underline" target='_blank' href={getExplorerObjectLink(latestCreatedMarket.marketplaceAddress, true)}>
                                      {latestCreatedMarket.marketplaceAddress}
                                    </Link>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                      )
                    }
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {/* <div>
        <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
          <CardHeader className="flex flex-row items-start bg-muted/50">
            <div className="grid gap-0.5">
              <CardTitle className="group flex items-center gap-2 text-lg">
                Order Oe31b70H
                <Button
                  size="icon"
                  variant="outline"
                  className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Copy className="h-3 w-3" />
                  <span className="sr-only">Copy Order ID</span>
                </Button>
              </CardTitle>
              <CardDescription>Date: November 23, 2023</CardDescription>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <Truck className="h-3.5 w-3.5" />
                <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                  Track Order
                </span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="outline" className="h-8 w-8">
                    <MoreVertical className="h-3.5 w-3.5" />
                    <span className="sr-only">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Export</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Trash</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-6 text-sm">
            <div className="grid gap-3">
              <div className="font-semibold">Order Details</div>
              <ul className="grid gap-3">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Glimmer Lamps x <span>2</span>
                  </span>
                  <span>$250.00</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Aqua Filters x <span>1</span>
                  </span>
                  <span>$49.00</span>
                </li>
              </ul>
              <Separator className="my-2" />
              <ul className="grid gap-3">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>$299.00</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>$5.00</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>$25.00</span>
                </li>
                <li className="flex items-center justify-between font-semibold">
                  <span className="text-muted-foreground">Total</span>
                  <span>$329.00</span>
                </li>
              </ul>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-3">
                <div className="font-semibold">Shipping Information</div>
                <address className="grid gap-0.5 not-italic text-muted-foreground">
                  <span>Liam Johnson</span>
                  <span>1234 Main St.</span>
                  <span>Anytown, CA 12345</span>
                </address>
              </div>
              <div className="grid auto-rows-max gap-3">
                <div className="font-semibold">Billing Information</div>
                <div className="text-muted-foreground">
                  Same as shipping address
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid gap-3">
              <div className="font-semibold">Customer Information</div>
              <dl className="grid gap-3">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Customer</dt>
                  <dd>Liam Johnson</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>
                    <a href="mailto:">liam@acme.com</a>
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd>
                    <a href="tel:">+1 234 567 890</a>
                  </dd>
                </div>
              </dl>
            </div>
            <Separator className="my-4" />
            <div className="grid gap-3">
              <div className="font-semibold">Payment Information</div>
              <dl className="grid gap-3">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1 text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    Visa
                  </dt>
                  <dd>**** **** **** 4532</dd>
                </div>
              </dl>
            </div>
          </CardContent>
          <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
            <div className="text-xs text-muted-foreground">
              Updated <time dateTime="2023-11-23">November 23, 2023</time>
            </div>
            <Pagination className="ml-auto mr-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <Button size="icon" variant="outline" className="h-6 w-6">
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span className="sr-only">Previous Order</span>
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button size="icon" variant="outline" className="h-6 w-6">
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="sr-only">Next Order</span>
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        </Card>
      </div> */}
    </div >
  );
}
