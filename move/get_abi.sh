#! /bin/bash
 
NETWORK=testnet
CONTRACT_ADDRESS=0x6913ef234d0f7d880e6e808d493e84227e3d6347674d1e11e22366ccd0f14e2a
MODULE_NAME=market
 
echo "export const ABI = $(curl https://fullnode.$NETWORK.aptoslabs.com/v1/accounts/$CONTRACT_ADDRESS/module/$MODULE_NAME | sed -n 's/.*"abi":\({.*}\).*}$/\1/p') as const" > ./lib/abi.ts