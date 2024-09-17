import { surfClientMarketplace } from "@/lib/aptos";
import { getLogger } from "./logger";

export const marketTypes = [`BTC`, `APT`, `SOL`, `USDC`, `ETH`] as const;

export interface AvailableMarket {
  address: `0x${string}`;
  type: (typeof marketTypes)[number];
}

export const getAvailableMarkets = async (
  marketplaceAddresses: `0x${string}`[]
): Promise<AvailableMarket[]> => {
  const availableMarkets: AvailableMarket[] = [];
  const logger = getLogger();

  for (const marketplaceAddress of marketplaceAddresses) {
    for (const marketType of marketTypes) {
      await surfClientMarketplace.view
        .available_markets({
          typeArguments: [
            `${process.env.AUTOMATED_SET_MODULE_ADDRESS}::switchboard_asset::${marketType}`,
          ],
          functionArguments: [marketplaceAddress],
        })
        .then((marketAddresses: [`0x${string}`[]]) => {
          marketAddresses.flat().forEach((marketAddress) => {
            availableMarkets.push({
              address: marketAddress,
              type: marketType,
            });
          });
        })
        .catch((error) => logger.error(error));
    }
  }

  return availableMarkets;
};
