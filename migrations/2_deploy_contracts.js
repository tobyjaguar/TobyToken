var TokenContract = artifacts.require("./ERC20TobyToken.sol")
var ShopContract = artifacts.require("./ERC20TokenShop.sol")

var name = "TobyToken"
var symbol = "TOBY"
var decimal = 18

module.exports = function(deployer) {
  deployer.deploy(TokenContract, name, symbol, decimal)
  .then(() => {
    return deployer.deploy(ShopContract, TokenContract.address)
  })
}
