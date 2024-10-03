"use client";
import { useResolveMarket } from "@/lib/hooks/useResolveMarket";
import { MarketData } from "@/lib/types/market";
import React, { useEffect, useState } from "react";
import { LoadingButton } from "./ui/loading-button";
import { DateTime, Duration } from "luxon";
import { useIsMounted } from "@/lib/hooks/useIsMounted";
import { useStartMarket } from '@/lib/hooks/useStartMarket';
import { formatTime } from '@/lib/utils';

export interface ResolveMarketButtonProps {
    marketData: MarketData;
}

export const ResolveMarketButton = (props: ResolveMarketButtonProps) => {
    const { marketData } = props;
    const { resolveMarket } = useResolveMarket();
    const { startMarket } = useStartMarket();
    const [isLoading, setResolveMarketLoading] = useState(false);
    const [isStartMarketDisabled, setIsStartMarketDisabled] = useState(
        !marketData ||
        marketData.startTime > DateTime.now().toSeconds() || // this works cause marketData gets updated every 3 seconds
        !!marketData.startPrice // if the end price is set, the market was already resolved
    );
    const [isResolveMarketDisabled, setIsResolveMarketDisabled] = useState(
        !marketData ||
        marketData.endTime > DateTime.now().toSeconds() || // this works cause marketData gets updated every 3 seconds
        !!marketData.endPrice // if the end price is set, the market was already resolved
    );
    const [resolveMarketInSeconds, setResolveMarketInSeconds] = useState(
        Math.floor(marketData.endTime - DateTime.now().toSeconds())
    );
    const [startMarketInSeconds, setStartMarketInSeconds] = useState(
        Math.floor(marketData.startTime - DateTime.now().toSeconds())
    );
    const isMounted = useIsMounted();

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (resolveMarketInSeconds > 0) {
            interval = setInterval(() => {
                setStartMarketInSeconds(startMarketInSeconds - 1);
                setResolveMarketInSeconds(resolveMarketInSeconds - 1);

                if (resolveMarketInSeconds <= 0) {
                    clearInterval(interval);
                    setIsStartMarketDisabled(false);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [startMarketInSeconds, resolveMarketInSeconds]);

    const onResolveMarket = async () => {
        if (!marketData) return;

        setResolveMarketLoading(true);
        await resolveMarket(marketData.address);
        setResolveMarketLoading(false);
    };

    const onStartMarket = async () => {
        if (!marketData) return;

        setResolveMarketLoading(true);
        await startMarket(marketData.address);
        setResolveMarketLoading(false);
    };



    function StartMarketButton(): React.ReactNode {
        return (
            <LoadingButton
                className="w-full"
                disabled={isStartMarketDisabled}
                loading={isLoading}
                onClick={onStartMarket}
            >
                <span>
                    Start Market{" "}
                    {isMounted && (startMarketInSeconds > 0) && (
                        <>
                            in{" "}
                            {formatTime(startMarketInSeconds)}
                        </>
                    )}
                </span>
            </LoadingButton>
        );
    }

    function ResolveMarketButton(): React.ReactNode {
        return (
            <LoadingButton
                className="w-full"
                disabled={isResolveMarketDisabled}
                loading={isLoading}
                onClick={onResolveMarket}
            >
                <span>
                    Resolve Market{" "}
                    {isMounted && (resolveMarketInSeconds > 0) && (
                        <>
                            in{" "}
                            {formatTime(resolveMarketInSeconds)}
                        </>
                    )}
                </span>
            </LoadingButton>
        );
    }


    return !marketData.startPrice ? <StartMarketButton /> : <ResolveMarketButton />;
};
