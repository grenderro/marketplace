#!/bin/bash

ENV=${1:-devnet}
PEM_FILE=${2:-wallet.pem}
CONTRACT_ADDRESS=${3:-$(cat contract-address.txt)}

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "Error: No contract address provided"
    exit 1
fi

if [ "$ENV" == "mainnet" ]; then
    PROXY="https://gateway.multiversx.com"
    CHAIN_ID="1"
else
    PROXY="https://devnet-gateway.multiversx.com"
    CHAIN_ID="D"
fi

echo "Upgrading contract $CONTRACT_ADDRESS on $ENV..."

# Build
cd marketplace-contract
sc-meta all build --release

# Upgrade
mxpy contract upgrade $CONTRACT_ADDRESS \
  --bytecode output/marketplace.wasm \
  --pem ../$PEM_FILE \
  --proxy $PROXY \
  --chain $CHAIN_ID \
  --recall-nonce \
  --gas-limit 100000000 \
  --send \
  --wait-result
