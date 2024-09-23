#! /bin/bash
 
NETWORK=testnet
CONTRACT_ADDRESS=0x51fcc02f80b6a89186cafc13cb3fdb5f8e5a1aafc78209ee24ac20b172e0a11f

MODULE_NAME=marketplace
echo "export const ABI = $(curl https://fullnode.$NETWORK.aptoslabs.com/v1/accounts/$CONTRACT_ADDRESS/module/$MODULE_NAME | sed -n 's/.*"abi":\({.*}\).*}$/\1/p') as const" > ./lib/marketplace-abi.ts

MODULE_NAME=market
echo "export const ABI = $(curl https://fullnode.$NETWORK.aptoslabs.com/v1/accounts/$CONTRACT_ADDRESS/module/$MODULE_NAME | sed -n 's/.*"abi":\({.*}\).*}$/\1/p') as const" > ./lib/market-abi.ts
