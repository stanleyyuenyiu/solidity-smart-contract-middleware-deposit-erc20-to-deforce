require('ts-node').register({
  files: true
})

require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider')

const mnemonicPhrase = process.env.MNEMONIC_PHRASE

module.exports = {
  defaultNetwork: 'fork',
  networks: {
    fork: {
      network_id: '*',
      provider: () =>
        new HDWalletProvider({
          mnemonic: {
            phrase: mnemonicPhrase
          },
          provider: 'http://localhost:8545',
          numberOfAddresses: 3,
        })
    },

    development_testnet: {
      fork: process.env.INFURA_MAINNET_HOST,
      network_id: 1
    },
    mainnet: {
      host: process.env.INFURA_MAINNET_HOST,
      network_id: 1
    },
    optimism: {
      host: process.env.INFURA_OPTIMISM_HOST,
      network_id: 10
    },
    arbitrum: {
      host: process.env.INFURA_ARBITRUM_HOST,
      network_id: 42161
    },
    bsc: {
      host: process.env.INFURA_BSC_HOST,
      network_id: 56
    },
    polygon: {
      host: process.env.INFURA_POLYGON_HOST,
      network_id: 137
    },
    harmony: {
      host: process.env.INFURA_HARMONY_HOST,
      network_id: 1666600000
    },
    avalanche: {
      host: process.env.INFURA_AVALANCE_HOST,
      network_id: 43114
    }
  },
  compilers: {
    solc: {
      version: '^0.8.6'
    }
  }
}
