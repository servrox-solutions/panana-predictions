"use client";

import { AvailableMarket } from "@/lib/get-available-markets";
import { Card } from "./ui/card";
import { useMarket } from "@/lib/hooks/useMarket";
import { MarketData } from "@/lib/types/market";
import { useIsMounted } from "@/lib/hooks/useIsMounted";
import { getExplorerObjectLink } from "@/lib/aptos";
import Link from "next/link";
import { formatAptPrice } from "@/lib/utils";
import { useResolveMarket } from "@/lib/hooks/useResolveMarket";
import { LoadingButton } from "./ui/loading-button";
import { useState } from "react";

interface MarketInfoProps {
  availableMarket: AvailableMarket;
  initialMarketData?: MarketData;
  children?: React.ReactNode;
}

export const MarketInfo: React.FC<MarketInfoProps> = ({
  availableMarket,
  initialMarketData,
  children,
}) => {
  const isMounted = useIsMounted();
  const { marketData } = useMarket(availableMarket, 3000, initialMarketData);

  const { resolveMarket } = useResolveMarket();
  const [resolveMarketLoading, setResolveMarketLoading] = useState(false);

  const onResolveMarket = async () => {
    if (!marketData) return;

    setResolveMarketLoading(true);
    await resolveMarket(marketData.address);
    setResolveMarketLoading(false);
  };

  return (
    <div className="grid grid-cols-4 grid-rows-8 gap-4 text-xs sm:text-base">
      <div className="col-span-4 sm:col-span-2 row-span-2">
        <Card className="h-full">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <dt className="font-medium text-muted-foreground">Address</dt>
              <p className="mt-1 text-ellipsis overflow-hidden">
                {marketData?.address ? (
                  <Link
                    className="underline"
                    target="_blank"
                    href={getExplorerObjectLink(marketData?.address, true)}
                  >
                    {marketData?.address}
                  </Link>
                ) : (
                  "n/a"
                )}
              </p>
            </div>

            <div>
              <dt className="font-medium text-muted-foreground">Creator</dt>
              <p className="mt-1 text-ellipsis overflow-hidden">
                {marketData?.creator ? (
                  <Link
                    className="underline"
                    target="_blank"
                    href={getExplorerObjectLink(marketData?.creator, true)}
                  >
                    {marketData?.creator}
                  </Link>
                ) : (
                  "n/a"
                )}
              </p>
            </div>
            <InfoItem
              label="Minimum Bet"
              value={`$${marketData?.minBet.toFixed(2)}`}
            />
            <InfoItem label="Fee" value={`${marketData?.fee}%`} />
          </div>
        </Card>
      </div>

      <div className="col-span-4 sm:col-span-2 row-span-2">
        <Card className="h-full">
          <div className="grid grid-cols-2 gap-4">
            <InfoItem
              label="Up Votes Sum"
              value={marketData?.upVotesSum ?? 0}
            />
            <InfoItem
              label="Down Votes Sum"
              value={marketData?.downVotesSum ?? 0}
            />
            <InfoItem
              label="Start Time"
              value={
                isMounted
                  ? new Date(marketData?.startTime ?? 0).toLocaleString()
                  : "n/a"
              }
            />
            <InfoItem
              label="End Time"
              value={
                isMounted
                  ? new Date(marketData?.endTime ?? 0).toLocaleString()
                  : "n/a"
              }
            />
          </div>
        </Card>
      </div>

      <div className="col-span-4 sm:col-span-3 row-span-5">{children}</div>

      <div className="col-span-4 sm:col-span-1 row-span-1 sm:row-span-5">
        <Card className="h-full">
          <div className="grid grid-cols-2 gap-4">
            <InfoItem
              label="Start Price"
              value={`$ ${
                marketData?.startPrice
                  ? formatAptPrice(marketData?.startPrice)
                  : "n/a"
              }`}
            />

            <InfoItem
              label="Price Direction"
              value={
                marketData?.priceUp === null
                  ? "n/a"
                  : marketData?.priceUp
                  ? "Up"
                  : "Down"
              }
            />

            <div className="col-span-2">
              <LoadingButton
                disabled={
                  !isMounted ||
                  !marketData ||
                  marketData.endTime > Math.floor(Date.now() / 1000) // this works cause marketData gets updated every 3 seconds
                }
                loading={resolveMarketLoading}
                onClick={onResolveMarket}
              >
                <span>Resolve Market</span>
              </LoadingButton>
            </div>
          </div>
        </Card>
      </div>

      <div className="col-span-4 row-span-1">
        <Card className="h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem
              label="Up Bets Sum"
              value={`$ ${
                marketData?.upBetsSum
                  ? formatAptPrice(marketData?.upBetsSum)
                  : "n/a"
              }`}
            />
            <InfoItem
              label="Down Bets Sum"
              value={`$ ${
                marketData?.downBetsSum
                  ? formatAptPrice(marketData?.downBetsSum)
                  : "n/a"
              }`}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

function InfoItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
