#! /bin/bash
 
NETWORK=testnet
CONTRACT_ADDRESS=0x91a6fb305a62b3cc1a8859b4336965dc22458a8c5f94064d2ea8c9d12584d3ac

MODULE_NAME=marketplace
echo "export const ABI = $(curl https://fullnode.$NETWORK.aptoslabs.com/v1/accounts/$CONTRACT_ADDRESS/module/$MODULE_NAME | sed -n 's/.*"abi":\({.*}\).*}$/\1/p') as const" > ./lib/marketplace-abi.ts

MODULE_NAME=market
echo "export const ABI = $(curl https://fullnode.$NETWORK.aptoslabs.com/v1/accounts/$CONTRACT_ADDRESS/module/$MODULE_NAME | sed -n 's/.*"abi":\({.*}\).*}$/\1/p') as const" > ./lib/market-abi.ts