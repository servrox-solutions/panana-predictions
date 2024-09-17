import { Market } from "@/lib/market";
import { AvailableMarket } from "./get-available-markets";

export const getMarketObject = async (
  availableMarket: AvailableMarket
): Promise<Market> => {
  const market = new Market(availableMarket);
  await market.initialize(availableMarket);

  return market;
};

export const getMarketObjects = async (
  availableMarkets: AvailableMarket[]
): Promise<Market[]> => {
  const marketObjects: Market[] = [];

  for (const availableMarket of availableMarkets) {
    const market = await getMarketObject(availableMarket);
    marketObjects.push(market);
  }

  return marketObjects;
};
