#! /bin/bash
 
NETWORK=testnet
CONTRACT_ADDRESS=0xa305a9f591b8d0ee4ad45659b6c6dc498822418bebf94a02b60d8b32dbf0dba5
MODULE_NAME=market
 
echo "export const ABI = $(curl https://fullnode.$NETWORK.aptoslabs.com/v1/accounts/$CONTRACT_ADDRESS/module/$MODULE_NAME | sed -n 's/.*"abi":\({.*}\).*}$/\1/p') as const" > ./lib/abi.ts