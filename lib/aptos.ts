import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { createSurfClient } from "@thalalabs/surf";
import { ABI } from "./abi";

const config = new AptosConfig({ network: Network.TESTNET });
export const aptos = new Aptos(config);
export const surfClient = createSurfClient(aptos).useABI(ABI);

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
