import { aptos } from "./aptos";

export const getAccountBalance = async (
  objectAddress: string
): Promise<number> => {
  return await aptos.getAccountAPTAmount({
    accountAddress: objectAddress,
  });
};
