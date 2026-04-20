# Decentralized Deployment Guide

Your marketplace now works **without a backend server** for core features.

## What Works Without a Backend

| Feature | Status | How It Works |
|---------|--------|--------------|
| Browse NFTs | ✅ | Queries `api.multiversx.com` directly |
| Search & Filter | ✅ | Uses MultiversX API |
| Wallet Connect | ✅ | `@multiversx/sdk-dapp` (Extension, Web, xPortal) |
| Buy / Sell / Auction | ✅ | Direct smart contract calls |
| Likes | ✅ | Client-side `localStorage` |
| Fiat On-Ramp | ⚠️ | Redirects to MoonPay/Transak widgets |

## What Needs AWS Lambda (Optional)

| Feature | Needs Lambda? | Notes |
|---------|--------------|-------|
| Fiat Escrow Webhooks | ✅ Yes | `lambda/webhook-handler.ts` |
| Competitions | ⚠️ Optional | Can use DynamoDB + Lambda |
| Social Features | ⚠️ Optional | Can use IPFS or DynamoDB |
| Analytics | ⚠️ Optional | Use The Graph protocol |

## Deploy Frontend to GitHub Pages

```bash
cd frontend
npm install
# Copy .env.example to .env and set your contract address
cp .env.example .env
# Edit .env with your values

npm run build
npm run deploy
```

Your site will be live at `https://grenderro.github.io/marketplace`

## Deploy Lambda to AWS (Optional)

```bash
cd lambda
# Install dependencies
npm init -y
npm install typescript @types/aws-lambda

# Compile
npx tsc webhook-handler.ts --target es2020 --module commonjs

# Deploy via AWS Console or Serverless Framework
# Set environment variables: MOONPAY_SECRET_KEY, CONTRACT_ADDRESS
```

## Smart Contract Deployment

```bash
cd contracts/marketplace
# Build
mxpy contract build
# Deploy to devnet
mxpy contract deploy --bytecode output/marketplace.wasm \
  --arguments 250 erd1... \
  --recall-nonce --gas-limit 60000000 \
  --pem wallet.pem --send
```

## Next Steps

1. Update `REACT_APP_CONTRACT_ADDRESS` in `.env` with your deployed contract
2. Rebuild and redeploy frontend
3. Test buying/selling on devnet
4. (Optional) Set up AWS Lambda for fiat webhooks
5. (Optional) Submit contract to MultiversX for audit before mainnet
