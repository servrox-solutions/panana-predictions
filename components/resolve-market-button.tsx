"use client";
import { useResolveMarket } from "@/lib/hooks/useResolveMarket";
import { MarketData } from "@/lib/types/market";
import { useEffect, useState } from "react";
import { LoadingButton } from "./ui/loading-button";
import { DateTime, Duration } from "luxon";
import { useIsMounted } from "@/lib/hooks/useIsMounted";

export interface ResolveMarketButtonProps {
  marketData: MarketData;
}

export const ResolveMarketButton = (props: ResolveMarketButtonProps) => {
  const { marketData } = props;
  const { resolveMarket } = useResolveMarket();
  const [resolveMarketLoading, setResolveMarketLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(
    !marketData ||
      marketData.endTime > DateTime.now().toSeconds() || // this works cause marketData gets updated every 3 seconds
      !!marketData.endPrice // if the end price is set, the market was already resolved
  );
  const [resolveMarketInSeconds, setResolveMarketInSeconds] = useState(
    Math.floor(marketData.endTime - DateTime.now().toSeconds())
  );
  const isMounted = useIsMounted();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (resolveMarketInSeconds > 0) {
      interval = setInterval(() => {
        setResolveMarketInSeconds(resolveMarketInSeconds - 1);
        if (resolveMarketInSeconds <= 0) {
          clearInterval(interval);
          setIsDisabled(false);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resolveMarketInSeconds]);

  const onResolveMarket = async () => {
    if (!marketData) return;

    setResolveMarketLoading(true);
    await resolveMarket(marketData.address);
    setResolveMarketLoading(false);
  };
  return (
    <LoadingButton
      className="w-full"
      disabled={isDisabled}
      loading={resolveMarketLoading}
      onClick={onResolveMarket}
    >
      <span>
        Resolve Market{" "}
        {isMounted && (
          <>
            in{" "}
            {Duration.fromObject({ seconds: resolveMarketInSeconds }).toFormat(
              "hh:mm:ss"
            )}{" "}
          </>
        )}
      </span>
    </LoadingButton>
  );
};
