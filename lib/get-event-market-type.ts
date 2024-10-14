import { MoveResource } from "@aptos-labs/ts-sdk";
import { aptos, MODULE_ADDRESS_FROM_ABI } from "./aptos";
import { EventMarketType } from "./types/market";
import { getLogger } from "./logger";
import { Address } from "./types/market";

export const getEventMarketType = async (address: Address): Promise<EventMarketType> => {
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
        `${MODULE_ADDRESS_FROM_ABI}::event_market::EventMarket<${MODULE_ADDRESS_FROM_ABI}::event_category::`
      )
    )
    ?.type.split("::")
    .pop()
    ?.slice(0, -1) as EventMarketType | undefined;

  if (!marketType) {
    const error = new Error("Market type not found.");
    logger.error(error);
    throw error;
  }

  return marketType;
};
