#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
ENV=${1:-devnet}
PEM_FILE=${2:-wallet.pem}

if [ "$ENV" == "mainnet" ]; then
    PROXY="https://gateway.multiversx.com"
    CHAIN_ID="1"
    EXPLORER="https://explorer.multiversx.com"
elif [ "$ENV" == "testnet" ]; then
    PROXY="https://testnet-gateway.multiversx.com"
    CHAIN_ID="T"
    EXPLORER="https://testnet-explorer.multiversx.com"
else
    PROXY="https://devnet-gateway.multiversx.com"
    CHAIN_ID="D"
    EXPLORER="https://devnet-explorer.multiversx.com"
fi

echo -e "${YELLOW}Deploying to $ENV...${NC}"

# Check wallet exists
if [ ! -f "$PEM_FILE" ]; then
    echo -e "${RED}Error: Wallet file $PEM_FILE not found${NC}"
    exit 1
fi

# Get wallet address
ADDRESS=$(mxpy wallet bech32 --pem $PEM_FILE)
echo -e "${GREEN}Wallet: $ADDRESS${NC}"

# Check balance
BALANCE=$(mxpy account get --address $ADDRESS --proxy $PROXY --balance)
echo -e "${GREEN}Balance: $BALANCE${NC}"

# Build contract
echo -e "${YELLOW}Building contract...${NC}"
cd marketplace-contract
sc-meta all build --release

# Deploy
echo -e "${YELLOW}Deploying contract...${NC}"
FEE_PERCENT=250  # 2.5%

mxpy contract deploy \
  --bytecode output/marketplace.wasm \
  --pem ../$PEM_FILE \
  --proxy $PROXY \
  --chain $CHAIN_ID \
  --recall-nonce \
  --gas-limit 100000000 \
  --arguments $FEE_PERCENT $ADDRESS \
  --send \
  --wait-result \
  --outfile ../deploy-result.json

if [ $? -eq 0 ]; then
    CONTRACT_ADDRESS=$(cat ../deploy-result.json | jq -r '.contractAddress')
    TX_HASH=$(cat ../deploy-result.json | jq -r '.txHash')
    
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}Contract: $CONTRACT_ADDRESS${NC}"
    echo -e "${GREEN}Tx: $EXPLORER/transactions/$TX_HASH${NC}"
    echo -e "${GREEN}Account: $EXPLORER/accounts/$CONTRACT_ADDRESS${NC}"
    
    # Save to file
    echo $CONTRACT_ADDRESS > ../contract-address.txt
    
    # Update multiversx.json
    jq --arg env "$ENV" --arg addr "$CONTRACT_ADDRESS" '.networks[$env].address = $addr' ../multiversx.json > tmp.json && mv tmp.json ../multiversx.json
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi
