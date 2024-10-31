import { aptos } from "./aptos";
import { getLogger } from "./logger";

export const getAccountBalance = async (
  objectAddress: string
): Promise<number> => {
  const logger = getLogger();
  return await aptos
    .getAccountAPTAmount({
      accountAddress: objectAddress,
    })
    .catch((error) => {
      logger.error(error);
      throw error;
    });
};
