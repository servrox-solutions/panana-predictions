import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { createSurfClient } from "@thalalabs/surf";
import { ABI as MarketplaceAbi } from "./marketplace-abi";
import { ABI as MarketAbi } from "./market-abi";
import { ABI as EventMarketAbi } from "./event-market-abi";
import { Address } from "./types/market";
import { TxnBuilderTypes } from 'aptos';


const config = new AptosConfig({ network: Network.TESTNET });
export const aptos = new Aptos(config);
export const surfClientMarketplace =
  createSurfClient(aptos).useABI(MarketplaceAbi);
export const surfClientMarket = createSurfClient(aptos).useABI(MarketAbi);
export const surfClientEventMarket =
  createSurfClient(aptos).useABI(EventMarketAbi);

export const MODULE_ADDRESS_FROM_ABI: Address =
  MarketplaceAbi.address ?? MarketAbi.address ?? EventMarketAbi.address;

export const MARKET_ABI = MarketAbi;
export const MARKETPLACE_ABI = MarketplaceAbi;
export const EVENT_MARKET_ABI = EventMarketAbi;

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

export const getExplorerAccountLink = (
  objectId: string,
  isTestnet = false
): string => {
  return `https://explorer.aptoslabs.com/account/${objectId}${
    isTestnet ? "?network=testnet" : ""
  }`;
};

export const isValidAddress = (address: string): boolean => {
  try {
    return TxnBuilderTypes.AccountAddress.isValid(address);
  } catch (err: unknown) {
    return false;
  }
}

export const octasToApt = (input: number): number => {
  return input / (10 ** 8);
}

export const aptToOctas = (input: number): number => {
  return input * (10 ** 8);
}