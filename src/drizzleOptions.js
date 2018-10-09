import TobyToken from './../build/contracts/ERC20TobyToken.json'
import TokenShop from './../build/contracts/ERC20TokenShop.json'

const drizzleOptions = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:8545'
    }
  },
  contracts: [
    TobyToken,
    TokenShop
  ],
  events: {
    //SimpleStorage: ['StorageSet']
    TokenShopBuy: ['LogBuyToken'],
    TokenShopSetExchange: ['LogSetExchangeRate'],
    TokenShopSetEthXRate: ['LogSetETHXRate'],
    TokenShopETHXUpdated: ['LogSetETHXUpdated'],
    TokenShopDeposit: ['LogDeposit'],
    TokenShopWithdraw: ['LogWithdraw'],
    TokenShopTaxOverride: ['LogSetOracleTaxOverride'],
    TokenShopQueryURL: ['LogSetQueryURL'],
    TokenShopOraclePriceType: ['LogSetOraclizePriceType'],
    TokenShopApproveBurn: ['LogApproveBurn']
  },
  polls: {
    accounts: 1500
  }
}

export default drizzleOptions
