import { surfClientMarketplace } from "@/lib/aptos";
import { getLogger } from "./logger";
import { AvailableMarketplace } from "./get-available-marketplaces";
import { Address, EventMarketType, MarketType } from "./types/market";

export interface AvailableMarket<T extends EventMarketType | MarketType> {
  address: Address;
  type: T;
}

export const getAvailableMarkets = async <
  T extends EventMarketType | MarketType
>(
  marketplaces: AvailableMarketplace[]
): Promise<AvailableMarket<T>[]> => {
  if (marketplaces.length === 0) return [];

  const availableMarkets: AvailableMarket<T>[] = [];
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
            type: marketplace.typeArgument.split("::").pop() as T,
          });
        });
      })
      .catch((error) => logger.error(error));
  }

  return availableMarkets;
};
