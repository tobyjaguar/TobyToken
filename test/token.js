//Promise = require("bluebird");
//Promise.promisifyAll(web3.eth, { suffix: "Promise"});
//var expectedExceptionPromise = require("./utils/expectedException.js");

Promise = require("bluebird");

var Token = artifacts.require("./ERC20TobyToken.sol");

const expectedExceptionPromise = require("../src/util/expectedException.js");
const sequentialPromise = require("../src/util/sequentialPromise.js");
web3.eth.makeSureHasAtLeast = require("../src/util/makeSureHasAtLeast.js");
web3.eth.makeSureAreUnlocked = require("../src/util/makeSureAreUnlocked.js");
web3.eth.getTransactionReceiptMined = require("../src/util/getTransactionReceiptMined.js");

if (typeof web3.eth.getBlockPromise !== "function") {
    Promise.promisifyAll(web3.eth, { suffix: "Promise" });
}

contract ('Token', function(accounts) {

  var owner = accounts[0];
  var user01 = accounts[1];
  var user02 = accounts[2];
  var addr00 = "0x0000000000000000000000000000000000000000";
  var name = "TobyToken";
  var symbol = "TOBY";
  var decimal = 18;
  var decimals = Math.pow(10,decimal);
  var supply = 1000 * decimals;
  var amount = 100 * decimals;
  var intOverflow = Math.pow(2,256) - 1;
  var maxJSvalue = Number.MAX_VALUE;

  beforeEach(function() {
    //console.log(JSON.stringify("symbol: " + result, null, 4));
    return Token.new(name,symbol,decimal, {from: owner})
    .then(function(instance) {
      contractInstance = instance;
    });
  });


  //test default values
  it("Should have correct default values", function() {
    return contractInstance.totalSupply({from: owner})
    .then(result => {
      assert.strictEqual(result.toNumber(), 0, "Contract should have 0 supply.");
      return contractInstance.name({from: owner});
    })
    .then(result => {
      assert.strictEqual(result, name, "Contract should have correct name.");
      return contractInstance.symbol({from: owner});
    })
    .then(result => {
      assert.strictEqual(result, symbol, "Contract should have correct symbol.");
      return contractInstance.decimals({from: owner});
    })
    .then(result => {
      //console.log(JSON.stringify("decimals: " + result, null, 4));
      assert.strictEqual(result.toNumber(), decimal, "Contract should hace correct number of decimals.");
    });
    //end test
  });

  //test mintalbe supply
  it("Should be able to mint supply", function() {
    return contractInstance.mint(owner, supply, {from: owner})
    .then(txObj => {
      //console.log(JSON.stringify(txObj, null, 4));
      assert.strictEqual(txObj.logs[0].event, "Transfer", "Logs did not return correctly");
      assert.strictEqual(txObj.logs[0].args.from, "0x0000000000000000000000000000000000000000", "Logs did not return correctly");
      assert.strictEqual(txObj.logs[0].args.to, owner, "Logs did not return correctly");
      assert.strictEqual(txObj.logs[0].args.value.toNumber(), supply, "Logs did not return correctly");
      return contractInstance.totalSupply({from: owner});
    })
    .then(result => {
      assert.equal(result, supply, "Contract should minted supply correctly.");
    });
    //end test
  });

  describe("Transfer tokens", function() {
    beforeEach(function() {
      return contractInstance.mint(owner, supply, {from: owner});
    });

    //test transfer functionality
    it("Should fail to transfer to a 0x address", function() {
      return expectedExceptionPromise(
          () => contractInstance.transfer(addr00, amount, {from: owner, gas: 3000000 }),
          3000000);
      //end test
    });

    //test transfer functionality
    it("Should fail to transfer more than supply", function() {
      return expectedExceptionPromise(
          () => contractInstance.transfer(addr00, amount + 1, {from: owner, gas: 3000000 }),
          3000000);
      //end test
    });

    //test transfer functionality
    it("Should be able to transfer", function() {
      return contractInstance.transfer(user01, amount, {from: owner})
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "Transfer", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.from, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.to, user01, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.value.toNumber(), amount, "Logs did not return correctly");
        return contractInstance.balanceOf(user01, {from: owner});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), amount, "balanceOf did not return correct transfer amount");
      });
      //end test
    });

    //test multiple transfers
    it("Should be able to transfer to multiple accounts", function() {
      return contractInstance.transfer(user01, amount, {from: owner})
      .then(txObj => {
        return contractInstance.balanceOf(user01, {from: owner});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), amount, "balanceOf did not return correct transfer amount");
        return contractInstance.transfer(user02, amount, {from: user01});
      })
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "Transfer", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.from, user01, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.to, user02, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.value.toNumber(), amount, "Logs did not return correctly");
        return contractInstance.balanceOf(user02, {from: owner});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), amount, "balanceOf did not return correct transfer amount");
      });
      //end test
    });

    //end describe
  });

  describe("Approving a transfer", function() {
    beforeEach(function() {
      return contractInstance.mint(owner, supply, {from: owner});
    });

    it("Should approve a transfer", function() {
      return contractInstance.approve(user01, amount, {from: owner})
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "Approval", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.owner, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.spender, user01, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.value.toNumber(), amount, "Logs did not return correctly");
        return contractInstance.allowance(owner, user01, {from: owner});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), amount, "_allowed did not return correctly");
      });
      //end test
    });

    it("Should increaseAllowance", function() {
      return contractInstance.approve(user01, amount, {from: owner})
      .then(txObj => {
        return contractInstance.increaseAllowance(user01, amount, {from: owner});
      })
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "Approval", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.owner, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.spender, user01, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.value.toNumber(), amount*2, "Logs did not return correctly");
        return contractInstance.allowance(owner, user01, {from: owner});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), amount*2, "increaseAllowance did not return correct amount");
      });
      //end test
    });

    it("Should decreaseAllowance", function() {
      return contractInstance.approve(user01, amount*2, {from: owner})
      .then(txObj => {
        return contractInstance.decreaseAllowance(user01, amount, {from: owner});
      })
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "Approval", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.owner, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.spender, user01, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.value.toNumber(), amount, "Logs did not return correctly");
        return contractInstance.allowance(owner, user01, {from: owner});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), amount, "increaseAllowance did not return correct amount");
      });
      //end test
    });

    //end describe
  });

  describe("Should implement TransferFrom", function() {
    beforeEach(function() {
      return contractInstance.mint(owner, supply, {from: owner})
      .then(() => {
        return contractInstance.approve(user01, amount, {from: owner});
      })
      .then(() => {
        return contractInstance.approve(user02, amount, {from: owner});
      });
    });

    it("Should be able to transferFrom after approved", function() {
      return contractInstance.transferFrom(owner, user01, amount, {from:user01})
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "Transfer", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.from, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.to, user01, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.value.toNumber(), amount, "Logs did not return correctly");
        return contractInstance.balanceOf(user01, {from: owner});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), amount, "balanceOf did not return correct amount");
        return contractInstance.transferFrom(owner, user02, amount, {from:user02})
      })
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "Transfer", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.from, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.to, user02, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.value.toNumber(), amount, "Logs did not return correctly");
        return contractInstance.balanceOf(user02, {from: owner});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), amount, "balanceOf did not return correct amount");
      });
      //end test
    });

    //end describe
  });

  describe("Should be mintable and burnable", function() {
    beforeEach(function() {
      return contractInstance.mint(owner, supply, {from: owner});
    });

    it("Should not burn more than the supply", function() {
      return expectedExceptionPromise(
          () => contractInstance.burn(supply * amount, {from: owner, gas: 3000000 }),
          3000000);
      //end test
    });

    it("Should be burnable from sending side", function() {
      return contractInstance.burn(amount, {from: owner})
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "Transfer", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.from, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.to, "0x0000000000000000000000000000000000000000", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.value.toNumber(), amount, "Logs did not return correctly");
        return contractInstance.balanceOf(owner, {from: owner});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), supply - amount, "balanceOf did not return correct amount");
        return contractInstance.totalSupply({from: owner});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), supply - amount, "totalSupply did not return correctly");
      });

      //end test
    });

    it("Should be burnable from a sender with a balance", function() {
      return contractInstance.transfer(user01, amount, {from: owner})
      .then(txObj => {
        return contractInstance.burn(amount, {from: user01})
      })
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "Transfer", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.from, user01, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.to, "0x0000000000000000000000000000000000000000", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.value.toNumber(), amount, "Logs did not return correctly");
        return contractInstance.balanceOf(user01, {from: user01});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), 0, "balanceOf did not return correct amount");
        return contractInstance.totalSupply({from: user01});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), supply - amount, "totalSupply did not return correctly");
      });

      //end test
    });

    it("Should be burnable from an allowed receiver with a balance", function() {
      return contractInstance.approve(user01, amount, {from: owner})
      .then(txObj => {
        return contractInstance.burnFrom(owner, amount, {from: user01})
      })
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "Transfer", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.from, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.to, "0x0000000000000000000000000000000000000000", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.value.toNumber(), amount, "Logs did not return correctly");
        return contractInstance.balanceOf(owner, {from: user01});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), supply - amount, "balanceOf did not return correct amount");
        return contractInstance.totalSupply({from: user01});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), supply - amount, "totalSupply did not return correctly");
      });

      //end test
    });

    //end describe
  })



});
