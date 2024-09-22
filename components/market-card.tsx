"use client";

import { useMarket } from "@/lib/hooks/useMarket";
import { AvailableMarket } from "@/lib/get-available-markets";
import { MarketCardSimpleUi } from "./market-card-simple-ui";
import { MarketData } from "@/lib/types/market";

interface MarketCardProps {
  availableMarket: AvailableMarket;
  initialMarketData?: MarketData;
}

export const MarketCard: React.FC<MarketCardProps> = ({
  availableMarket,
  initialMarketData,
}) => {
  const { marketData } = useMarket(availableMarket, 3000, initialMarketData);

  return (
    <MarketCardSimpleUi
      minBet={marketData?.minBet ?? 1337}
      pool={marketData?.pool ?? 1337}
      betCloseTime={marketData?.startTime ?? 1336}
      resolveTime={marketData?.endTime ?? 1337}
      market={marketData?.address ?? "0x1"}
      tradingPair={marketData?.tradingPair ?? { one: "APT", two: "USD" }}
      oddsUp={marketData?.oddsUp ?? "13.37"}
      oddsDown={marketData?.oddsDown ?? "13.37"}
      upVotesSum={marketData?.upVotesSum ?? 1337}
      downVotesSum={marketData?.downVotesSum ?? 1337}
    />
  );
};
