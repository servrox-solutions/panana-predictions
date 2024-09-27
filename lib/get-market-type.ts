import { MoveResource } from "@aptos-labs/ts-sdk";
import { aptos, MODULE_ADDRESS_FROM_ABI } from "./aptos";
import { MarketType } from "./types/market";
import { getLogger } from "./logger";
import { Address } from "./types/market";

export const getMarketType = async (address: Address): Promise<MarketType> => {
  const logger = getLogger();

  const ressources: MoveResource[] = await aptos
    .getAccountResources({
      accountAddress: address,
    })
    .catch((error) => {
      logger.error(error);
      throw error;
    });

  const marketType = ressources
    .find((r) =>
      r.type.startsWith(
        `${MODULE_ADDRESS_FROM_ABI}::market::Market<${MODULE_ADDRESS_FROM_ABI}::switchboard_asset::`
      )
    )
    ?.type.split("::")
    .pop()
    ?.slice(0, -1) as MarketType | undefined;

  if (!marketType) {
    const error = new Error("Market type not found.");
    logger.error(error);
    throw error;
  }

  return marketType;
};
