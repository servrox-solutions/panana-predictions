import { surfClientMarketplace } from "@/lib/aptos";
import { getLogger } from "./logger";

export const getAvailableMarketplaces = async (): Promise<`0x${string}`[]> => {
  const logger = getLogger();

  const marketplaceAddresses = await surfClientMarketplace.view
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

  return marketplaceAddresses.flat() as `0x${string}`[];
};
