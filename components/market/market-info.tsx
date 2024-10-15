"use client";

import { AvailableMarket } from "@/lib/get-available-markets";
import { Card } from "../ui/card";
import { useMarket } from "@/lib/hooks/useMarket";
import { MarketData, MarketType } from "@/lib/types/market";
import { useIsMounted } from "@/lib/hooks/useIsMounted";
import { getExplorerObjectLink, octasToApt } from "@/lib/aptos";
import Link from "next/link";
import { formatAptPrice } from "@/lib/utils";
import { DateTime } from 'luxon';

interface MarketInfoProps {
  availableMarket: AvailableMarket<MarketType>;
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
              value={`APT ${(octasToApt(marketData?.minBet ?? 0)).toFixed(2)}`}
            />
            <InfoItem label="Fee" value={`${(marketData?.fee ?? 0) * 100} %`} />
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
                isMounted && marketData?.startTime
                  ? DateTime.fromSeconds(marketData.startTime).toLocaleString(DateTime.DATETIME_MED)
                  : "n/a"
              }
            />
            <InfoItem
              label="End Time"
              value={
                isMounted && marketData?.endTime
                  ? DateTime.fromSeconds(marketData.endTime).toLocaleString(DateTime.DATETIME_MED)
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
              value={`$ ${marketData?.startPrice
                ? formatAptPrice(marketData?.startPrice)
                : "n/a"
                }`}
            />
            <InfoItem
              label="End Price"
              value={`$ ${marketData?.endPrice
                ? formatAptPrice(marketData?.endPrice)
                : "n/a"
                }`}
            />
          </div>
        </Card>
      </div>

      <div className="col-span-4 row-span-1">
        <Card className="h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem
              label="Up Bets Sum"
              value={`APT ${marketData?.upBetsSum
                ? formatAptPrice(marketData?.upBetsSum)
                : "n/a"
                }`}
            />
            <InfoItem
              label="Down Bets Sum"
              value={`APT ${marketData?.downBetsSum
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
