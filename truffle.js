require('dotenv').config()

var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = process.env.WALLET_MNEMONIC;
var infuraKey = process.env.INFURA_ACCESS_TOKEN;

module.exports = {
  migrations_directory: "./migrations",
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/" + infuraKey)
      },
      gas: 8000000,
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
