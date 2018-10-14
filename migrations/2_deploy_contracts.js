var TokenContract = artifacts.require("./ERC20TobyToken.sol")
var ShopContract = artifacts.require("./ERC20TokenShop.sol")

var name = "TobyToken"
var symbol = "TOBY"
var decimal = 18

var deployedToken = TokenContract.at("0x24EbE93E9BD9773074D0D2C6009D99064d6A4aaa")
var deployedShop = ShopContract.at("0xe916c39463EbB4c699031544a7fa6C07ceDe1dAE")

module.exports = function(deployer) {
  deployer.deploy(TokenContract, name, symbol, decimal {gas: 1500000, gasPrice: 10000000000})
  .then(() => {
    return deployer.deploy(ShopContract, TokenContract.address {gas: 5000000, gasPrice: 10000000000})
  })
}
