require('dotenv').config()

var HDWalletProvider = require("truffle-hdwallet-provider");
var mainnetMnemonic = process.env.TOBYTOKEN_WALLET_MNEMONIC;
var ropstenMnemonic = process.env.ROPSTEN_WALLET_MNEMONIC;
var infuraKey = process.env.INFURA_ACCESS_TOKEN;

module.exports = {
  migrations_directory: "./migrations",
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    mainnet: {
      provider: function() {
        return new HDWalletProvider(mainnetMnemonic, "https://mainnet.infura.io/" + infuraKey)
      },
      network_id: 1
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(ropstenMnemonic, "https://ropsten.infura.io/" + infuraKey)
      },
      gas: 6300000,
      network_id: 3
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 500
    }
  }
};
