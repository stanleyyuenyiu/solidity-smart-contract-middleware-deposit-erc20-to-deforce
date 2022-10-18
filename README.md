# solidity-smart-contract-middleware-deposit-erc20-to-deforce

## Introduction
This is a test contract to deploy a ERC20 / eth token to dforce lending protocol to earn interest, where the contract itself will charge network fee
https://developers.dforce.network/lend/lend-and-synth


## Prerequisite
- install truffle  -- https://trufflesuite.com/ganache/
- register infura account -- https://infura.io/login?redirect=%2Fdashboard

## How to Deploy 

```bash
# Generate tuffle type
yarn postinstall

# Start the fork of the mainnet
yarn start_fork

# Deploy the contracts
yarn migrate:fork
```
