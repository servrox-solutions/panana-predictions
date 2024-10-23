import {
  MODULE_ADDRESS_FROM_ABI,
  surfClientEventMarket,
  surfClientMarket,
} from "./aptos";
import { AvailableMarket } from "./get-available-markets";
import { getLogger } from "./logger";
import { EventMarketType } from "./types/market";

export interface EventMarketRessource {
  accepted: {
    vec: Array<any>;
  };
  accepted_or_rejected_at: {
    vec: Array<any>;
  };
  answers: Array<string>;
  bets: Array<{
    buckets: {
      inner: {
        handle: string;
      };
      length: string;
    };
    level: number;
    num_buckets: string;
    size: string;
    split_load_threshold: number;
    target_bucket_size: string;
  }>;
  created_at_timestamp: string;
  creator: string;
  down_votes_sum: string;
  fee: {
    denominator: string;
    numerator: string;
  };
  min_bet: string;
  question: string;
  rejection_reason: {
    vec: Array<any>;
  };
  resolved_at: {
    vec: Array<any>;
  };
  rules: string;
  total_bets: Array<string>;
  up_votes_sum: string;
  user_votes: {
    data: Array<any>;
  };
  winning_answer_idx: {
    vec: string;
  };
}

export const getEventMarketRessource = async (
  availableMarket: AvailableMarket<EventMarketType>
): Promise<EventMarketRessource> => {
  const logger = getLogger();
  const market = await surfClientEventMarket.resource
    .EventMarket({
      account: availableMarket.address,
      typeArguments: [
        `${MODULE_ADDRESS_FROM_ABI}::event_category::${availableMarket.type}`,
      ],
    })
    .then((market) => market as unknown as EventMarketRessource)
    .catch((error) => {
      logger.error(error);
      throw error;
    });

  return market as unknown as EventMarketRessource;
};
