import { surfClientMarket } from "./aptos";
import { AvailableMarket } from "./get-available-markets";
import { getLogger } from "./logger";

export interface MarketRessource {
  creator: string;
  down_bets: {
    data: unknown[];
  };
  down_bets_sum: string;
  down_votes_sum: string;
  end_time: string;
  fee: {
    denominator: string;
    numerator: string;
  };
  min_bet: string;
  price_delta: {
    denominator: string;
    numerator: string;
  };
  price_up: {
    vec: unknown[];
  };
  start_price: string;
  start_time: string;
  up_bets: {
    data: unknown[];
  };
  up_bets_sum: string;
  up_votes_sum: string;
  user_votes: {
    data: unknown[];
  };
}

export const getMarketRessource = async (
  availableMarket: AvailableMarket
): Promise<MarketRessource> => {
  const logger = getLogger();
  const market = await surfClientMarket.resource
    .Market({
      account: availableMarket.address,
      typeArguments: [
        `${process.env.AUTOMATED_SET_MODULE_ADDRESS}::switchboard_asset::${availableMarket.type}`,
      ],
    })
    .then((market) => market as unknown as MarketRessource)
    .catch((error) => {
      logger.error(error);
      throw error;
    });

  return market;
};
