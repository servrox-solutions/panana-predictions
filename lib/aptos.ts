import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { createSurfClient } from "@thalalabs/surf";
import { ABI as MarketplaceAbi } from "./marketplace-abi";
import { ABI as MarketAbi } from "./market-abi";
import { Address } from "./types/market";

const config = new AptosConfig({ network: Network.TESTNET });
export const aptos = new Aptos(config);
export const surfClientMarketplace =
  createSurfClient(aptos).useABI(MarketplaceAbi);
export const surfClientMarket = createSurfClient(aptos).useABI(MarketAbi);

export const MODULE_ADDRESS_FROM_ABI: Address =
  MarketplaceAbi.address ?? MarketAbi.address;

// Use Surf to executes an entry function
// const result = await surfClient.entry.transfer({
//   functionArguments: ['0x1', 1],
//   typeArguments: ['0x1::aptos_coin::AptosCoin'],
//   account: Account.fromPrivateKey(...),
// });

// // Use Surf to query a view function
// const [balance] = await surfClient.view.balance({
//   functionArguments: ['0x1'],
//   typeArguments: ['0x1::aptos_coin::AptosCoin'],
// });

export const getExplorerObjectLink = (
  objectId: string,
  isTestnet = false
): string => {
  return `https://explorer.aptoslabs.com/object/${objectId}${
    isTestnet ? "?network=testnet" : ""
  }`;
};
