import { MODULE_ADDRESS_FROM_ABI, surfClientMarketplace } from "@/lib/aptos";
import { getLogger } from "./logger";
import { Address } from "./types/market";
import { MarketType } from "./types/market";

export interface AvailableMarketplacesResponse {
  data: { key: Address; value: Address }[];
}

export interface AvailableMarketplace {
  address: Address;
  typeArgument: `${string}::${string}::${MarketType}`;
}

export const getAvailableMarketplaces = async (): Promise<
  AvailableMarketplace[]
> => {
  const logger = getLogger();

  const marketplaces = await surfClientMarketplace.view
    .available_marketplaces({
      typeArguments: [],
      functionArguments: [MODULE_ADDRESS_FROM_ABI],
    })
    .catch((error) => {
      logger.error(error);
      return [];
    });

  const availableMarketplaces =
    (marketplaces as AvailableMarketplacesResponse[])?.[0]?.data.map(
      (marketplace) => ({
        address: marketplace.key,
        typeArgument:
          marketplace.value as `${string}::${string}::${MarketType}`,
      })
    ) ?? [];

  return availableMarketplaces;
};
