"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ResolvedMarket, ResolvedMarketsTable } from "./resolved-markets-table";
import { CreatedMarket, CreatedMarketsTable } from "./created-markets-table";
import { useState } from "react";
import { SupportedAsset } from "@/lib/types/market";
import { FilterDropdown } from "./filter-dropdown";

export interface DashboardContentProps {
  latestCreatedMarkets: CreatedMarket[];
  latestResolvedMarkets: ResolvedMarket[];
  totalVolume: {
    usd: number;
    apt: number;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export function DashboardContent({
  latestCreatedMarkets,
  latestResolvedMarkets,
  totalVolume,
  searchParams,
}: DashboardContentProps) {
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

  const [filter, setFilter] = useState<SupportedAsset[]>(
    urlSearchParams.get("dashboard")?.split(",") as SupportedAsset[]
  );

  const filterNetworks: SupportedAsset[] = Array.from(
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

    router.push(`${pathname}${query}`);
  };

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
        <div className="lg:grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 hidden">
          <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
            <CardHeader className="pb-3">
              <CardTitle>All Markets</CardTitle>
              <CardDescription className="max-w-lg text-balance leading-relaxed">
                You can also create your own market to predict the future price
                of an asset.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/markets">
                <Button className="capitalize">Create new market</Button>
              </Link>
            </CardFooter>
          </Card>
          <Card x-chunk="dashboard-05-chunk-1">
            <CardHeader className="pb-2">
              <CardDescription>Total Volume (all assets)</CardDescription>
              <CardTitle className="text-4xl">
                ${totalVolume.usd} mio.
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                ({totalVolume.apt} APT)
              </div>
            </CardContent>
            {/* <CardFooter>
              <Progress value={25} aria-label="25% increase" />
            </CardFooter> */}
          </Card>
          {/* <Card x-chunk="dashboard-05-chunk-2">
            <CardHeader className="pb-2">
              <CardDescription>Last 7 Days</CardDescription>
              <CardTitle className="text-4xl">$35,329</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">(2345 APT)</div>
            </CardContent>
          </Card> */}
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
              <FilterDropdown
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
    </div>
  );
}
