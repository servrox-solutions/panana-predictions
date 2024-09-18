import { surfClientMarketplace } from "@/lib/aptos";
import { getLogger } from "./logger";
import { AvailableMarketplace } from "./get-available-marketplaces";

export const marketTypes = [`BTC`, `APT`, `SOL`, `USDC`, `ETH`] as const;

export interface AvailableMarket {
  address: `0x${string}`;
  type: (typeof marketTypes)[number];
}

export const getAvailableMarkets = async (
  marketplaces: AvailableMarketplace[]
): Promise<AvailableMarket[]> => {
  const availableMarkets: AvailableMarket[] = [];
  const logger = getLogger();

  for (const marketplace of marketplaces) {
    await surfClientMarketplace.view
      .available_markets({
        typeArguments: [`${marketplace.typeArgument}`],
        functionArguments: [marketplace.address],
      })
      .then((marketAddresses: [`0x${string}`[]]) => {
        marketAddresses.flat().forEach((marketAddress) => {
          availableMarkets.push({
            address: marketAddress,
            type: marketplace.typeArgument
              .split("::")
              .pop() as (typeof marketTypes)[number],
          });
        });
      })
      .catch((error) => logger.error(error));
  }

  return availableMarkets;
};
