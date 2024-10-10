#! /bin/bash
 
NETWORK=testnet
CONTRACT_ADDRESS=`grep '^AUTOMATED_SET_MODULE_ADDRESS=' .env | cut -d '=' -f 2`

MODULE_NAME=marketplace
echo "export const ABI = $(curl https://fullnode.$NETWORK.aptoslabs.com/v1/accounts/$CONTRACT_ADDRESS/module/$MODULE_NAME | sed -n 's/.*"abi":\({.*}\).*}$/\1/p') as const" > ./lib/marketplace-abi.ts

MODULE_NAME=market
echo "export const ABI = $(curl https://fullnode.$NETWORK.aptoslabs.com/v1/accounts/$CONTRACT_ADDRESS/module/$MODULE_NAME | sed -n 's/.*"abi":\({.*}\).*}$/\1/p') as const" > ./lib/market-abi.ts

MODULE_NAME=event_market
echo "export const ABI = $(curl https://fullnode.$NETWORK.aptoslabs.com/v1/accounts/$CONTRACT_ADDRESS/module/$MODULE_NAME | sed -n 's/.*"abi":\({.*}\).*}$/\1/p') as const" > ./lib/event-market-abi.ts
