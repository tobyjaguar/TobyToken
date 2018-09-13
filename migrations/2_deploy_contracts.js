var SimpleStorage = artifacts.require("SimpleStorage");
var TutorialToken = artifacts.require("TutorialToken");
var ComplexStorage = artifacts.require("ComplexStorage");

var TokenContract = artifacts.require("./ERC20TobyToken.sol");
var StoreContract = artifacts.require("./ERC20TokenStore.sol");

var name = "TobyToken";
var symbol = "TOBY"
var decimal = Math.pow(10,18)
var supply = 1000 * decimal

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(TutorialToken);
  deployer.deploy(ComplexStorage);
  deployer.deploy(TokenContract, name, symbol, supply)
  .then(() => {
    return deployer.deploy(StoreContract, TokenContract.address);
  });
};
