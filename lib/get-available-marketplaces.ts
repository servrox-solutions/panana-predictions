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

export const getAvailableMarketplaces = async (marketplaceType: 'switchboard_asset' | 'event_category' = 'switchboard_asset'): Promise<
  AvailableMarketplace[]
> => {
  const logger = getLogger();

  const marketplaces = await surfClientMarketplace.view
    .available_marketplaces({
      typeArguments: [],
      functionArguments: [marketplaceType === 'switchboard_asset' ? MODULE_ADDRESS_FROM_ABI : '0x59e9982aaa5194058e51c8be75519ec54c518ea3651b3a4a87c39b9bd88ba314'], // TODO: only use Marketplace_abi address
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

  
  return availableMarketplaces.filter(marketplace => marketplace.typeArgument.split('::')[1] === marketplaceType);
};
