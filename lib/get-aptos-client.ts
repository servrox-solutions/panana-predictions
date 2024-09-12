import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

let aptosClient: Aptos | null = null;

export const getAptosClient = (): Aptos => {
  if (!aptosClient) {
    const config = new AptosConfig({ network: Network.TESTNET });
    aptosClient = new Aptos(config);
  }
  return aptosClient;
};
