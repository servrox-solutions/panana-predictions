import { MODULE_ADDRESS_FROM_ABI, surfClientMarket } from "./aptos";
import { AvailableMarket } from "./get-available-markets";
import { getLogger } from "./logger";

export interface MarketRessource {
  creator: string;
  down_bets: {
    data: { key: string; value: string }[];
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
    vec: boolean[];
  };
  start_price: string;
  start_time: string;
  up_bets: {
    data: { key: string; value: string }[];
  };
  up_bets_sum: string;
  up_votes_sum: string;
  user_votes: {
    data: { key: string; value: boolean }[];
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
        `${MODULE_ADDRESS_FROM_ABI}::switchboard_asset::${availableMarket.type}`,
      ],
    })
    .then((market) => market as unknown as MarketRessource)
    .catch((error) => {
      logger.error(error);
      throw error;
    });

  return market;
};
