import { MarketInfo } from "@/components/market-info";
import { Card } from "@/components/ui/card";
import { AvailableMarket } from "@/lib/get-available-markets";
import { getMarketType } from "@/lib/get-market-type";
import { initializeMarket } from "@/lib/initialize-market";
import { Address, MarketData } from "@/lib/types/market";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { MarketTitle } from "@/components/market-title";
import { TradingViewWidget } from "@/components/trading-view-widget";
import { MarketCardTimeline } from "@/components/market-card-timeline";

export default async function Market({
  params,
}: {
  params: { address: string };
}) {
  const marketType = await getMarketType(params.address as Address);

  const availableMarket: AvailableMarket = {
    address: params.address as Address,
    type: marketType,
  };

  const marketData: MarketData = await initializeMarket(availableMarket);

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        className="mb-8"
        linkHref="/markets"
        linkTitle="Markets"
        pageName={marketData.name}
      />

      <MarketTitle
        tradingPair={marketData.tradingPair}
        resolveTime={marketData.endTime}
        betCloseTime={marketData.startTime}
        className="text-3xl"
      />

      <Card className="h-full my-4">
        <MarketCardTimeline
          createTime={marketData.createdAt}
          betCloseTime={marketData.startTime}
          endTime={marketData.endTime}
        />
      </Card>

      <MarketInfo
        availableMarket={availableMarket}
        initialMarketData={marketData}
      >
        <Card className="h-full bg-[#161a25] backdrop-grayscale-none bg-opacity-100 backdrop-blur-none">
          <TradingViewWidget marketType={marketType} />
        </Card>
      </MarketInfo>
    </div>
  );
}
