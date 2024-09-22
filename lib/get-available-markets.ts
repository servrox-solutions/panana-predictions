import { surfClientMarketplace } from "@/lib/aptos";
import { getLogger } from "./logger";
import { AvailableMarketplace } from "./get-available-marketplaces";
import { Address } from "./types/market";

export const marketTypes = [`BTC`, `APT`, `SOL`, `USDC`, `ETH`] as const;

export interface AvailableMarket {
  address: Address;
  type: (typeof marketTypes)[number];
}

export const getAvailableMarkets = async (
  marketplaces: AvailableMarketplace[]
): Promise<AvailableMarket[]> => {
  if (marketplaces.length === 0) return [];

  const availableMarkets: AvailableMarket[] = [];
  const logger = getLogger();

  for (const marketplace of marketplaces) {
    await surfClientMarketplace.view
      .available_markets({
        typeArguments: [`${marketplace.typeArgument}`],
        functionArguments: [marketplace.address],
      })
      .then((marketAddresses: [Address[]]) => {
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
