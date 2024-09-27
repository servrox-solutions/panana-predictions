import { aptos } from "@/lib/aptos";
import { CommittedTransactionResponse } from "@aptos-labs/ts-sdk";
import { createEntryPayload } from "@thalalabs/surf";
import { ABI as MarketAbi } from "@/lib/market-abi";
import {
  AccountInfo,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";
import { Address } from "./types/market";

export interface CreateMarketPayload {
  type: `${string}::${string}::${string}`;
  marketplace: Address;
  startTimeTimestampSeconds: number;
  endTimeTimestampSeconds: number;
  minBet: number;
}

export const createMarket = async (
  account: AccountInfo,
  signAndSubmitTransaction: (
    transaction: InputTransactionData
  ) => Promise<{ hash: string }>,
  payload: CreateMarketPayload
): Promise<CommittedTransactionResponse> => {
  if (!account) {
    throw new Error("user not signed in");
  }
  const {
    type,
    marketplace,
    startTimeTimestampSeconds,
    endTimeTimestampSeconds,
    minBet,
  } = payload;

  const contractPayload = createEntryPayload(MarketAbi, {
    function: "create_market",
    typeArguments: [type],
    functionArguments: [
      marketplace,
      startTimeTimestampSeconds,
      endTimeTimestampSeconds,
      minBet,
      2,
      100,
    ],
  });

  const transactionResponse = await signAndSubmitTransaction({
    sender: account.address,
    data: contractPayload,
  });

  console.log("🍧", transactionResponse);

  return await aptos.waitForTransaction({
    transactionHash: transactionResponse.hash,
  });
};
