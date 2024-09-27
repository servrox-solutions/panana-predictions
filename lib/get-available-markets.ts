import { surfClientMarketplace } from "@/lib/aptos";
import { getLogger } from "./logger";
import { AvailableMarketplace } from "./get-available-marketplaces";
import { Address, MarketType } from "./types/market";

export interface AvailableMarket {
  address: Address;
  type: MarketType;
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
            type: marketplace.typeArgument.split("::").pop() as MarketType,
          });
        });
      })
      .catch((error) => logger.error(error));
  }

  return availableMarkets;
};
