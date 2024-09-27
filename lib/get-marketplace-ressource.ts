import { surfClientMarketplace } from "./aptos";
import { MarketType } from "./types/market";
import { getLogger } from "./logger";
import { Address } from "./types/market";

export interface MarketplaceRessource {
  available_markets: Address[]; // contains all addresses of running and open markets
  switchboard_feed: Address; // switchboard asset feed for market resolution
  all_time_volume: number; // total volume that was traded on this marketplace
}

export interface MarketplaceRessourceIdentifier {
  address: Address;
  type: `${string}::${string}::${MarketType}`;
}

export const getMarketplaceRessource = async (
  ressourceIdentifier: MarketplaceRessourceIdentifier
): Promise<MarketplaceRessource> => {
  const logger = getLogger();

  const marketplace = await surfClientMarketplace.resource
    .Marketplace({
      account: ressourceIdentifier.address,
      typeArguments: [ressourceIdentifier.type],
    })
    .then((marketplace) => marketplace as unknown as MarketplaceRessource)
    .catch((error) => {
      logger.error(error);
      throw error;
    });

  return marketplace;
};
