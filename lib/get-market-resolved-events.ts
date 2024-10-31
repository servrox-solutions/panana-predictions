import { aptos } from "./aptos";
import { getLogger } from "./logger";

export interface MarketResolvedEventData {
  creator: string;
  market: {
    inner: string;
  };
  dissolved: boolean;
  market_cap: string;
  end_price: number;
  start_price: number;
  marketplace: {
    inner: string;
  };
  end_time_timestamp: string;
  start_time_timestamp: string;
}
export const getMarketResolvedEvents = async (
  moduleId: string,
  assetType: string,
  limit = 10
) => {
  const logger = getLogger();
  return (
    await aptos
      .getModuleEventsByEventType({
        eventType: `${moduleId}::market::ResolveMarket<${assetType}>`,
        options: {
          orderBy: [
            {
              transaction_block_height: "desc",
            },
          ],
          limit,
        },
      })
      .catch((error) => {
        logger.error(error);
        throw error;
      })
  ).map((x) => x.data as MarketResolvedEventData);
};
