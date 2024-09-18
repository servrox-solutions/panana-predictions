#! /bin/bash
 
NETWORK=testnet
CONTRACT_ADDRESS=0x0a007e13d9a6ac196cacf33e077f1682fa49649f1aa3b129afa9fab1ea93501b

MODULE_NAME=marketplace
echo "export const ABI = $(curl https://fullnode.$NETWORK.aptoslabs.com/v1/accounts/$CONTRACT_ADDRESS/module/$MODULE_NAME | sed -n 's/.*"abi":\({.*}\).*}$/\1/p') as const" > ./lib/marketplace-abi.ts

MODULE_NAME=market
echo "export const ABI = $(curl https://fullnode.$NETWORK.aptoslabs.com/v1/accounts/$CONTRACT_ADDRESS/module/$MODULE_NAME | sed -n 's/.*"abi":\({.*}\).*}$/\1/p') as const" > ./lib/market-abi.ts
