#! /bin/bash
 
NETWORK=testnet
CONTRACT_ADDRESS=0xe8315f6f2ad67caccce0b79a6ae92bae1188bae8dd9a6713d6318461038eba39

MODULE_NAME=marketplace 
echo "export const ABI = $(curl https://fullnode.$NETWORK.aptoslabs.com/v1/accounts/$CONTRACT_ADDRESS/module/$MODULE_NAME | sed -n 's/.*"abi":\({.*}\).*}$/\1/p') as const" > ./lib/marketplace-abi.ts

MODULE_NAME=market 
echo "export const ABI = $(curl https://fullnode.$NETWORK.aptoslabs.com/v1/accounts/$CONTRACT_ADDRESS/module/$MODULE_NAME | sed -n 's/.*"abi":\({.*}\).*}$/\1/p') as const" > ./lib/market-abi.ts
