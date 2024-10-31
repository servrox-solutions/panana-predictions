import { aptos } from "./aptos";
import { getLogger } from "./logger";

export interface MarketCreatedEventData {
  creator: string;
  market: {
    inner: string;
  };
  marketplace: {
    inner: string;
  };
  end_time_timestamp: string;
  start_time_timestamp: string;
  created_at_timestamp: string;
  min_bet: string;
}

export const getMarketCreatedEvents = async (
  moduleId: string,
  assetType: string,
  limit = 10
) => {
  const logger = getLogger();
  return (
    await aptos
      .getModuleEventsByEventType({
        eventType: `${moduleId}::market::CreateMarket<${assetType}>`,
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
  ).map((x) => x.data as MarketCreatedEventData);
};
