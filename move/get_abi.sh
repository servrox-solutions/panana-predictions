#! /bin/bash
 
NETWORK=testnet
CONTRACT_ADDRESS=0x51a9217bbc1845b450ebad40bde0d93735db32a36c55080a80f74df2977fbc82
MODULE_NAME=market
 
echo "export const ABI = $(curl https://fullnode.$NETWORK.aptoslabs.com/v1/accounts/$CONTRACT_ADDRESS/module/$MODULE_NAME | sed -n 's/.*"abi":\({.*}\).*}$/\1/p') as const" > ./lib/abi.ts