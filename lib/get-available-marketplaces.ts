import { surfClientMarketplace } from "@/lib/aptos";
import { getLogger } from "./logger";

export interface AvailableMarketplacesResponse {
  data: { key: `0x${string}`; value: `0x${string}` }[];
}

export interface AvailableMarketplace {
  address: `0x${string}`;
  typeArgument: string;
}

export const getAvailableMarketplaces = async (): Promise<
  AvailableMarketplace[]
> => {
  const logger = getLogger();

  const marketplaces = await surfClientMarketplace.view
    .available_marketplaces({
      typeArguments: [],
      functionArguments: [
        process.env.AUTOMATED_SET_MODULE_ADDRESS as `0x${string}`,
      ],
    })
    .catch((error) => {
      logger.error(error);
      return [];
    });

  const availableMarketplaces = (
    marketplaces as AvailableMarketplacesResponse[]
  )?.[0]?.data.map((marketplace) => ({
    address: marketplace.key,
    typeArgument: marketplace.value,
  }));

  return availableMarketplaces;
};
