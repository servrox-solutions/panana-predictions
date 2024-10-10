import { EVENT_MARKET_ABI, aptos } from "@/lib/aptos";
import { CommittedTransactionResponse } from "@aptos-labs/ts-sdk";
import { createEntryPayload } from "@thalalabs/surf";
import {
  AccountInfo,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";
import { Address } from "./types/market";

export interface CreateEventMarketPayload {
  type: `${string}::${string}::${string}`;
  marketplace: Address;
  question: string;
  rules: string;
  answers: string[];
  minBet: number;
}

export const creatEventMarket = async (
  account: AccountInfo,
  signAndSubmitTransaction: (
    transaction: InputTransactionData
  ) => Promise<{ hash: string }>,
  payload: CreateEventMarketPayload
): Promise<CommittedTransactionResponse> => {
  if (!account) {
    throw new Error("user not signed in");
  }
  const {
    type,
    marketplace,
    question,
    rules,
    answers,
    minBet,
  } = payload;

  const contractPayload = createEntryPayload(EVENT_MARKET_ABI, {
    function: "create_market",
    typeArguments: [type],
    functionArguments: [
      marketplace,
      minBet,
      2,
      100,
      question,
      rules,
      answers,
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
