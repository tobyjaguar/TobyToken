var SimpleStorage = artifacts.require("SimpleStorage")
var SimpleStorage02 = artifacts.require("SimpleStorage02")
var TutorialToken = artifacts.require("TutorialToken")
var ComplexStorage = artifacts.require("ComplexStorage")

var TokenContract = artifacts.require("./ERC20TobyToken.sol")
var StoreContract = artifacts.require("./ERC20TokenStore.sol")

var name = "TobyToken"
var symbol = "TOBY"
var decimal = 18

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage)
  deployer.deploy(SimpleStorage02)
  deployer.deploy(TutorialToken)
  deployer.deploy(ComplexStorage)
  deployer.deploy(TokenContract, name, symbol, decimal)
  .then(() => {
    return deployer.deploy(StoreContract, TokenContract.address)
  })
}
