//Promise = require("bluebird");
//Promise.promisifyAll(web3.eth, { suffix: "Promise"});
//var expectedExceptionPromise = require("./utils/expectedException.js");

Promise = require("bluebird");
var Token = artifacts.require("./ERC20TobyToken.sol");
var Store = artifacts.require("./ERC20TokenStore.sol");

const expectedExceptionPromise = require("../src/util/expectedException.js");
const sequentialPromise = require("../src/util/sequentialPromise.js");
web3.eth.makeSureHasAtLeast = require("../src/util/makeSureHasAtLeast.js");
web3.eth.makeSureAreUnlocked = require("../src/util/makeSureAreUnlocked.js");
web3.eth.getTransactionReceiptMined = require("../src/util/getTransactionReceiptMined.js");

if (typeof web3.eth.getBlockPromise !== "function") {
    Promise.promisifyAll(web3.eth, { suffix: "Promise" });
}

contract ('Store', function(accounts) {

  var tokenInstance;
  var storeInstance;
  var owner = accounts[0];
  var user01 = accounts[1];
  var user02 = accounts[2];
  var addr00 = "0x0000000000000000000000000000000000000000";
  var name = "TobyToken";
  var symbol = "TOBY";
  var decimal = 18;
  var decimals = Math.pow(10,decimal);
  var supply = 1000 * decimals;
  var exchangeRate = 1;

  beforeEach(function() {
    //console.log(JSON.stringify("symbol: " + result, null, 4));
    return Token.new(name,symbol,decimal, {from: owner})
    .then(instance => {
      tokenInstance = instance;
      return Store.new(tokenInstance.address, {from: owner});
    })
    .then(instance => {
      storeInstance = instance;
      return tokenInstance.mint(storeInstance.address, supply, {from: owner});
    });
  });

  //test default values
  it("Should have correct default values", function() {
    return storeInstance.getTokenSupply({from: owner})
    .then(result => {
      assert.strictEqual(result.toNumber(), supply, "Contract did not return correct supply.");
      return storeInstance.getTokenBalance(storeInstance.address, {from: owner});
    })
    .then(result => {
      assert.strictEqual(result.toNumber(), supply, "Contract did not return correct balance.");
      return storeInstance.getTokenName({from: owner});
    })
    .then(result => {
      assert.strictEqual(result, name, "Contract should have correct name.");
      return storeInstance.getTokenSymbol({from: owner});
    })
    .then(result => {
      assert.strictEqual(result, symbol, "Contract should have correct symbol.");
      return storeInstance.getTokenDecimals({from: owner});
    })
    .then(result => {
      //console.log(JSON.stringify("decimals: " + result, null, 4));
      assert.strictEqual(result.toNumber(), decimal, "Contract should hace correct number of decimals.");
    });
    //end test
  });

  //Test Ownable
  describe("Ownable Contract functionality", function() {
    it("Should have correct Owner", function() {
      return storeInstance.owner({from: owner})
      .then(result => {
        assert.strictEqual(result, owner, "Owner param did not return correctly");
      });
      //end test
    });

    it("Should return true for isOwner", function() {
      return storeInstance.isOwner({from: owner})
      .then(result => {
        assert.isTrue(result, "isOwner param did not return correctly");
      });
      //end test
    });

    it("Should return renounce ownership", function() {
      return storeInstance.renounceOwnership({from: owner})
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "OwnershipRenounced", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.previousOwner, owner, "Logs did not return correctly");
        return storeInstance.owner({from: owner});
      })
      .then(result => {
        assert.strictEqual(result, "0x0000000000000000000000000000000000000000", "Owner did not return correctly");
      });
      //end test
    });

    it("Should return transfer ownership", function() {
      return storeInstance.transferOwnership(user01, {from: owner})
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "OwnershipTransferred", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.previousOwner, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.newOwner, user01, "Logs did not return correctly");
        return storeInstance.owner({from: owner});
      })
      .then(result => {
        assert.strictEqual(result, user01, "Owner did not return correctly");
      });
      //end test
    });

    //end describe
  });

  //Test Pausable
  describe("Pausable Contract functionality", function() {

    it("Should have correct Pausable role", function() {
      return storeInstance.isPauser(owner, {from: owner})
      .then(result => {
        assert.isTrue(result, "Pauser param did not return correctly");
      });
      //end test
    });

    it("Should be unpaused by default", function() {
      return storeInstance.paused({from: owner})
      .then(result => {
        assert.isFalse(result, "Pause param did not return correctly");
      })
      //end test
    });

    it("Should pause/unpause contract", function() {
      return storeInstance.pause({from: owner})
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "Paused", "Logs did not return correctly");
        return storeInstance.paused({from: owner});
      })
      .then(result => {
        assert.isTrue(result, "Pause param did not return correctly");
        return storeInstance.unpause({from: owner});
      })
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "Unpaused", "Logs did not return correctly");
        return storeInstance.paused({from: owner});
      })
      .then(result => {
        assert.isFalse(result, "Pause param did not return correctly");
      });
      //end test
    });

    //end describe
  });

  //Test set functions
  describe("Set Stock functionality", function() {

    it("Should be initialized with zero stock", function() {
      return storeInstance.getStoreStock({from: owner})
      .then(result => {
        assert.strictEqual(result.toNumber(), 0, "Stock param did not return correctly");
      });
      //end test
    });

    it("Should be able to set Store Stock", function() {
      return storeInstance.setStoreStock({from: owner})
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "LogSetStoreStock", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eSender, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eTokenStock.toNumber(), supply, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eStoreStock.toNumber(), supply, "Logs did not return correctly");
        return storeInstance.getStoreStock({from: owner});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), supply, "Stock param did not return correctly");
      });
      //end test
    });

    //test pausable functionality
    it("Should fail to set Store Stock if paused", function() {
      return storeInstance.pause({from: owner})
      .then(() => {
        return storeInstance.paused({from: owner});
      })
      .then(result => {
        assert.isTrue(result, "Contract is not paused");
        return expectedExceptionPromise(
            () => storeInstance.setStoreStock({from: owner, gas: 3000000 }),
            3000000);
      });
      //end test
    });

    //end describe
  })

  describe("Set Exchange Rate", function() {
    var rate01 = 1;
    var rate05 = 5;
    var newExchangeRate;

    it("Should get default Exchange Rate", function() {
      return storeInstance.exchangeRate({from: owner})
      .then(result => {
        assert.strictEqual(result.toNumber(), exchangeRate * decimals, "Exchange Rate param did not return correctly");
      });
      //end test
    });

    it("Should set exchange rate to 1", function() {
      return storeInstance.setExchangeRate(rate01, {from: owner})
      .then(txObj => {
        newExchangeRate = decimals/rate01;
        assert.strictEqual(txObj.logs[0].event, "LogSetExchangeRate", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eSender, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eRate.toNumber(), rate01, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eExchangeRate.toNumber(), newExchangeRate, "Logs did not return correctly");
        return storeInstance.exchangeRate({from: owner});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), newExchangeRate, "Exchange Rate param did not update correctly");
      });

      //end test
    });

    it("Should set exchange rate to 5", function() {
      return storeInstance.setExchangeRate(rate05, {from: owner})
      .then(txObj => {
        newExchangeRate = decimals/rate05;
        assert.strictEqual(txObj.logs[0].event, "LogSetExchangeRate", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eSender, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eRate.toNumber(), rate05, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eExchangeRate.toNumber(), newExchangeRate, "Logs did not return correctly");
        return storeInstance.exchangeRate({from: owner});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), newExchangeRate, "Exchange Rate param did not update correctly");
      });

      //end test
    });

    //test ownership functionality
    it("Should fail to set Exchange Rate when not owner", function() {
      return expectedExceptionPromise(
          () => storeInstance.setExchangeRate(rate05, {from: user01, gas: 3000000 }),
          3000000);
      //end test
    });

    //test pausable functionality
    it("Should fail to set Exchange Rate if paused", function() {
      return storeInstance.pause({from: owner})
      .then(() => {
        return storeInstance.paused({from: owner});
      })
      .then(result => {
        assert.isTrue(result, "Contract is not paused");
        return expectedExceptionPromise(
            () => storeInstance.setExchangeRate(rate05, {from: user01, gas: 3000000 }),
            3000000);
      });
      //end test
    });


    //end describe
  });

  describe("Set ETH to Dollar Rate functionality", function() {
    var ethXrate = 200;

    it("Should be initialized to zero", function() {
      return storeInstance.USDTETH({from: owner})
      .then(result => {
        assert.strictEqual(result.toNumber(), 0, "USDTETH param did not return correctly");
      });
      //end test
    });

    it("Should be able to set ETH xRate", function() {
      return storeInstance.setETHXRate(ethXrate, {from: owner})
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "LogSetETHXRate", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eSender, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eETHXRate.toNumber(), ethXrate, "Logs did not return correctly");
        return storeInstance.USDTETH({from: owner});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), ethXrate, "Stock param did not return correctly");
      });
      //end test
    });

    //test ownership functionality
    it("Should fail to set ETH xRate if not owner", function() {
      return expectedExceptionPromise(
          () => storeInstance.setETHXRate(ethXrate, {from: user01, gas: 3000000 }),
          3000000);
      //end test
    });

    //test pausable functionality
    it("Should fail to set Store Stock if paused", function() {
      return storeInstance.pause({from: owner})
      .then(() => {
        return storeInstance.paused({from: owner});
      })
      .then(result => {
        assert.isTrue(result, "Contract is not paused");
        return expectedExceptionPromise(
            () => storeInstance.setETHXRate(ethXrate, {from: owner, gas: 3000000 }),
            3000000);
      });
      //end test
    });

    //end describe
  });

  //test deposits and withdrawals
  describe("Deposit and Withdraw functionality", function() {
    var amount = 1000;
    var gasPrice;
    var gasUsed;
    var txFee;
    var initialBalance;

    it("Should be able to receive funds", function() {
      return web3.eth.getBalancePromise(owner)
      .then(result => {
        initialBalance = result;
      })
      .then(() => {
        return storeInstance.deposit.call({from: owner, value: amount})
      })
      .then(result => {
        assert.isTrue(result, "Function call did not return true");
        return storeInstance.deposit({from: owner, value: amount});
      })
      .then(txObj => {
        gasUsed = txObj.receipt.gasUsed;
        assert.strictEqual(txObj.logs[0].event, "LogDeposit", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eSender, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eValue.toNumber(), amount, "Logs did not return correctly");
        return web3.eth.getTransactionPromise(txObj.tx);
      })
      .then(tx => {
        gasPrice = tx.gasPrice;
        txFee = gasUsed * gasPrice;
        return web3.eth.getBalancePromise(storeInstance.address);
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), amount, "Contract balance did not return correctly");
        return web3.eth.getBalancePromise(owner);
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), initialBalance.minus(amount).minus(txFee).toNumber(), "Account did not return correct balance");
      });
      //end test
    });

    it("Should be able to withdraw funds", function() {
      return web3.eth.getBalancePromise(owner)
      .then(result => {
        initialBalance = result;
      })
      .then(() => {
        return storeInstance.deposit.call({from: owner, value: amount})
      })
      .then(result => {
        assert.isTrue(result, "Function call did not return true");
        return storeInstance.deposit({from: owner, value: amount});
      })
      .then(txObj => {
        gasUsed = txObj.receipt.gasUsed;
        return web3.eth.getTransactionPromise(txObj.tx);
      })
      .then(tx => {
        gasPrice = tx.gasPrice;
        txFee = gasUsed * gasPrice;
        return storeInstance.withdraw(amount, {from: owner});
      })
      .then(txObj => {
        gasUsed = txObj.receipt.gasUsed;
        assert.strictEqual(txObj.logs[0].event, "LogWithdraw", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eSender, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eValue.toNumber(), amount, "Logs did not return correctly");
        return web3.eth.getTransactionPromise(txObj.tx);
      })
      .then(tx => {
        gasPrice = tx.gasPrice;
        txFee += gasUsed * gasPrice;
        return web3.eth.getBalancePromise(storeInstance.address);
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), amount-amount, "Contract balance did not return correctly");
        return web3.eth.getBalancePromise(owner);
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), initialBalance.minus(txFee).toNumber(), "Account did not return correct balance");
      });
      //end test
    });


    //test ownership functionality
    it("Should fail to set deposit if not owner", function() {
      return expectedExceptionPromise(
          () => storeInstance.deposit({from: user01, value: amount, gas: 3000000 }),
          3000000);
      //end test
    });

    it("Should fail to set withdraw if not owner", function() {
      return storeInstance.deposit({from: owner, value: amount})
      .then(() => {
      return expectedExceptionPromise(
          () => storeInstance.withdraw(amount, {from: user01, gas: 3000000 }),
          3000000);
        });
      //end test
    });

    //test pausable functionality
    it("Should fail to deposit if paused", function() {
      return storeInstance.pause({from: owner})
      .then(() => {
        return storeInstance.paused({from: owner});
      })
      .then(result => {
        assert.isTrue(result, "Contract should be paused");
        return expectedExceptionPromise(
            () => storeInstance.deposit({from: user01, value: amount, gas: 3000000 }),
            3000000);
      });
      //end test
    });

    it("Should fail to withdraw if paused", function() {
      return storeInstance.deposit({from: owner, value: amount})
      .then(() => {
        return storeInstance.pause({from: owner});
      })
      then(() => {
        return storeInstance.paused({from: owner});
      })
      .then(result => {
        assert.isTrue(result, "Contract should be paused");
        return expectedExceptionPromise(
            () => storeInstance.withdraw(amount, {from: user01, gas: 3000000 }),
            3000000);
      });
      //end test
    });

    //end describe
  });

  describe("Buying tokens from the Store Contract", function() {
    var amount = 1000;
    var tokenAmount;
    var usdtethRate = 200;

    beforeEach(function() {
      return storeInstance.setETHXRate(usdtethRate, {from: owner})
      .then(() => {
        return storeInstance.setStoreStock({from: user01});
      })
    });

    it("Should be able to buy tokens from the Store", function() {
      //calculate token amount to be purchased
      //wei amount * ETH exchange rate per wei * inverse of exchangeRate
      //dollars per wei * 1 / exchange rate (i.e. dollars per token bit)
      tokenAmount = Math.round((amount * decimals * usdtethRate) / (decimals * exchangeRate));

      return storeInstance.buyToken({from: user01, value: amount})
      .then(txObj => {
        //console.log(JSON.stringify(tokenAmount, null, 4));
        assert.strictEqual(txObj.logs[1].event, "LogBuyToken", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[1].args.eSender, user01, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[1].args.eValue.toNumber(), amount, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[1].args.eTokenAmount.toNumber(), tokenAmount, "Logs did not return correctly");
        return storeInstance.getTokenBalance(user01, {From: owner});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), tokenAmount, "Token balance did not return correctly");
      });

      //end test
    });

    //end describe
  });


});
