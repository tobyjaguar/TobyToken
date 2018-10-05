//Promise = require("bluebird");
//Promise.promisifyAll(web3.eth, { suffix: "Promise"});
//var expectedExceptionPromise = require("./utils/expectedException.js");

Promise = require("bluebird");
var Token = artifacts.require("./ERC20TobyToken.sol");
var Shop = artifacts.require("./ERC20TokenShop.sol");

const expectedExceptionPromise = require("../src/util/expectedException.js");
const sequentialPromise = require("../src/util/sequentialPromise.js");
web3.eth.makeSureHasAtLeast = require("../src/util/makeSureHasAtLeast.js");
web3.eth.makeSureAreUnlocked = require("../src/util/makeSureAreUnlocked.js");
web3.eth.getTransactionReceiptMined = require("../src/util/getTransactionReceiptMined.js");

if (typeof web3.eth.getBlockPromise !== "function") {
    Promise.promisifyAll(web3.eth, { suffix: "Promise" });
}

contract ('Shop', function(accounts) {

  var tokenInstance;
  var shopInstance;
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
      return Shop.new(tokenInstance.address, {from: owner});
    })
    .then(instance => {
      shopInstance = instance;
      return tokenInstance.mint(shopInstance.address, supply, {from: owner});
    });
  });

  //test default values
  it("Should have correct default values", function() {
    return shopInstance.getTokenSupply({from: owner})
    .then(result => {
      assert.strictEqual(result.toNumber(), supply, "Contract did not return correct supply.");
      return shopInstance.getTokenBalance(shopInstance.address, {from: owner});
    })
    .then(result => {
      assert.strictEqual(result.toNumber(), supply, "Contract did not return correct balance.");
      return shopInstance.getTokenName({from: owner});
    })
    .then(result => {
      assert.strictEqual(result, name, "Contract should have correct name.");
      return shopInstance.getTokenSymbol({from: owner});
    })
    .then(result => {
      assert.strictEqual(result, symbol, "Contract should have correct symbol.");
      return shopInstance.getTokenDecimals({from: owner});
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
      return shopInstance.owner({from: owner})
      .then(result => {
        assert.strictEqual(result, owner, "Owner param did not return correctly");
      });
      //end test
    });

    it("Should return true for isOwner", function() {
      return shopInstance.isOwner({from: owner})
      .then(result => {
        assert.isTrue(result, "isOwner param did not return correctly");
      });
      //end test
    });

    it("Should return renounce ownership", function() {
      return shopInstance.renounceOwnership({from: owner})
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "OwnershipRenounced", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.previousOwner, owner, "Logs did not return correctly");
        return shopInstance.owner({from: owner});
      })
      .then(result => {
        assert.strictEqual(result, "0x0000000000000000000000000000000000000000", "Owner did not return correctly");
      });
      //end test
    });

    it("Should return transfer ownership", function() {
      return shopInstance.transferOwnership(user01, {from: owner})
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "OwnershipTransferred", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.previousOwner, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.newOwner, user01, "Logs did not return correctly");
        return shopInstance.owner({from: owner});
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
      return shopInstance.isPauser(owner, {from: owner})
      .then(result => {
        assert.isTrue(result, "Pauser param did not return correctly");
      });
      //end test
    });

    it("Should be unpaused by default", function() {
      return shopInstance.paused({from: owner})
      .then(result => {
        assert.isFalse(result, "Pause param did not return correctly");
      })
      //end test
    });

    it("Should pause/unpause contract", function() {
      return shopInstance.pause({from: owner})
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "Paused", "Logs did not return correctly");
        return shopInstance.paused({from: owner});
      })
      .then(result => {
        assert.isTrue(result, "Pause param did not return correctly");
        return shopInstance.unpause({from: owner});
      })
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "Unpaused", "Logs did not return correctly");
        return shopInstance.paused({from: owner});
      })
      .then(result => {
        assert.isFalse(result, "Pause param did not return correctly");
      });
      //end test
    });

    //end describe
  });

  //Test set functions
  describe("Shop Stock functionality", function() {

    it("Should return supply minted to shop contract", function() {

      return shopInstance.getTokenBalance(shopInstance.address, {from: owner})
      .then(result => {
        assert.strictEqual(result.toNumber(), supply, "Stock param did not return correctly");
      });
      //end test
    });

    //end describe
  });

  describe("Set Exchange Rate", function() {
    var rate01 = 1;
    var rate05 = 5;
    var newExchangeRate;

    it("Should get default Exchange Rate", function() {
      return shopInstance.exchangeRate({from: owner})
      .then(result => {
        assert.strictEqual(result.toNumber(), exchangeRate * decimals, "Exchange Rate param did not return correctly");
      });
      //end test
    });

    it("Should set exchange rate to 1", function() {
      return shopInstance.setExchangeRate(rate01, {from: owner})
      .then(txObj => {
        newExchangeRate = decimals/rate01;
        assert.strictEqual(txObj.logs[0].event, "LogSetExchangeRate", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eSender, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eRate.toNumber(), rate01, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eExchangeRate.toNumber(), newExchangeRate, "Logs did not return correctly");
        return shopInstance.exchangeRate({from: owner});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), newExchangeRate, "Exchange Rate param did not update correctly");
      });

      //end test
    });

    it("Should set exchange rate to 5", function() {
      return shopInstance.setExchangeRate(rate05, {from: owner})
      .then(txObj => {
        newExchangeRate = decimals/rate05;
        assert.strictEqual(txObj.logs[0].event, "LogSetExchangeRate", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eSender, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eRate.toNumber(), rate05, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eExchangeRate.toNumber(), newExchangeRate, "Logs did not return correctly");
        return shopInstance.exchangeRate({from: owner});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), newExchangeRate, "Exchange Rate param did not update correctly");
      });

      //end test
    });

    //test ownership functionality
    it("Should fail to set Exchange Rate when not owner", function() {
      return expectedExceptionPromise(
          () => shopInstance.setExchangeRate(rate05, {from: user01, gas: 3000000}),
          3000000);
      //end test
    });

    //test pausable functionality
    it("Should fail to set Exchange Rate if paused", function() {
      return shopInstance.pause({from: owner})
      .then(() => {
        return shopInstance.paused({from: owner});
      })
      .then(result => {
        assert.isTrue(result, "Contract is not paused");
        return expectedExceptionPromise(
            () => shopInstance.setExchangeRate(rate05, {from: user01, gas: 3000000}),
            3000000);
      });
      //end test
    });

    //end describe
  });

  describe("Set ETH to Dollar Rate functionality", function() {
    var ethXrate = 200;

    it("Should be initialized to zero", function() {
      return shopInstance.USDTETH({from: owner})
      .then(result => {
        assert.strictEqual(result.toNumber(), 0, "USDTETH param did not return correctly");
      });
      //end test
    });

    it("Should be able to set ETH xRate", function() {
      return shopInstance.setETHXRateOverride(ethXrate, {from: owner})
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "LogSetETHXRateOverride", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eSender, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eETHXRate.toNumber(), ethXrate, "Logs did not return correctly");
        return shopInstance.USDTETH({from: owner});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), ethXrate, "Stock param did not return correctly");
      });
      //end test
    });

    //test ownership functionality
    it("Should fail to set ETH xRate if not owner", function() {
      return expectedExceptionPromise(
          () => shopInstance.setETHXRateOverride(ethXrate, {from: user01, gas: 3000000}),
          3000000);
      //end test
    });

    //test pausable functionality
    it("Should fail to set Shop Stock if paused", function() {
      return shopInstance.pause({from: owner})
      .then(() => {
        return shopInstance.paused({from: owner});
      })
      .then(result => {
        assert.isTrue(result, "Contract is not paused");
        return expectedExceptionPromise(
            () => shopInstance.setETHXRateOverride(ethXrate, {from: owner, gas: 3000000}),
            3000000);
      });
      //end test
    });

    //end describe
  });

  describe("Set Tax Rate Override", function() {
    var taxRate01 = 1*decimals/100;
    var taxRate05 = 5*decimals/1000;

    it("Should get default Tax Rate", function() {
      return shopInstance.oracleTax({from: owner})
      .then(result => {
        assert.strictEqual(result.toNumber(), 0, "Tax Rate param did not return correctly");
      });
      //end test
    });

    it("Should set tax rate to 10000000000000000", function() {
      return shopInstance.setOracleTaxOverride(taxRate01, {from: owner})
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "LogSetOracleTaxOverride", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eSender, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eOracleTax.toNumber(), taxRate01, "Logs did not return correctly");
        return shopInstance.oracleTax({from: owner});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), taxRate01, "Tax Rate param did not update correctly");
      });
      //end test
    });

    it("Should set tax rate to 5000000000000000", function() {
      return shopInstance.setOracleTaxOverride(taxRate05, {from: owner})
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "LogSetOracleTaxOverride", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eSender, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eOracleTax.toNumber(), taxRate05, "Logs did not return correctly");
        return shopInstance.oracleTax({from: owner});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), taxRate05, "Tax Rate param did not update correctly");
      });
      //end test
    });

    //test ownership functionality
    it("Should fail to set Tax Rate when not owner", function() {
      return expectedExceptionPromise(
          () => shopInstance.setOracleTaxOverride(taxRate05, {from: user01, gas: 3000000}),
          3000000);
      //end test
    });

    //test pausable functionality
    it("Should fail to set Exchange Rate if paused", function() {
      return shopInstance.pause({from: owner})
      .then(() => {
        return shopInstance.paused({from: owner});
      })
      .then(result => {
        assert.isTrue(result, "Contract is not paused");
        return expectedExceptionPromise(
            () => shopInstance.setOracleTaxOverride(taxRate05, {from: user01, gas: 3000000}),
            3000000);
      });
      //end test
    });

    //end describe
  });

  describe("Set ETH to Dollar Rate functionality", function() {
    var ethXrate = 200;

    it("Should be initialized to zero", function() {
      return shopInstance.USDTETH({from: owner})
      .then(result => {
        assert.strictEqual(result.toNumber(), 0, "USDTETH param did not return correctly");
      });
      //end test
    });

    it("Should be able to set ETH xRate", function() {
      return shopInstance.setETHXRateOverride(ethXrate, {from: owner})
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "LogSetETHXRateOverride", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eSender, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eETHXRate.toNumber(), ethXrate, "Logs did not return correctly");
        return shopInstance.USDTETH({from: owner});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), ethXrate, "Stock param did not return correctly");
      });
      //end test
    });

    //test ownership functionality
    it("Should fail to set ETH xRate if not owner", function() {
      return expectedExceptionPromise(
          () => shopInstance.setETHXRateOverride(ethXrate, {from: user01, gas: 3000000}),
          3000000);
      //end test
    });

    //test pausable functionality
    it("Should fail to set Shop Stock if paused", function() {
      return shopInstance.pause({from: owner})
      .then(() => {
        return shopInstance.paused({from: owner});
      })
      .then(result => {
        assert.isTrue(result, "Contract is not paused");
        return expectedExceptionPromise(
            () => shopInstance.setETHXRateOverride(ethXrate, {from: owner, gas: 3000000}),
            3000000);
      });
      //end test
    });

    //end describe
  });

  describe("Changing Oracle parameters", function() {
    var oraclizePriceType = "URL";
    var oraclizePriceType2 = "someotherstring";
    var queryURL = "json(https://api.gdax.com/products/ETH-USD/ticker).price";
    var query2URL = "json(https://bittrex.com/api/v1.1/public/getticker?market=USDT-ETH).result.Last";

    it("Should set oraclizePriceType ", function() {
      return shopInstance.setOraclizePriceType(oraclizePriceType, {from: owner})
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "LogSetOraclizePriceType", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eSender, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eOraclizePriceType, oraclizePriceType, "Logs did not return correctly");
        return shopInstance.oraclizePriceType({from: owner});
      })
      .then(result => {
        assert.strictEqual(result, oraclizePriceType, "OraclizePriceType param did not return correctly");
        return shopInstance.setOraclizePriceType(oraclizePriceType2, {from: owner});
      })
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "LogSetOraclizePriceType", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eSender, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eOraclizePriceType, oraclizePriceType2, "Logs did not return correctly");
        return shopInstance.oraclizePriceType({from: owner});
      })
      .then(result => {
        assert.strictEqual(result, oraclizePriceType2, "OraclizePriceType2 param did not return correctly");
      });
      //end test
    });

    it("Should set queryURL", function() {
      return shopInstance.setQueryURL(queryURL, {from: owner})
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "LogSetQueryURL", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eSender, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eQueryURL, queryURL, "Logs did not return correctly");
        return shopInstance.queryURL({from: owner});
      })
      .then(result => {
        assert.strictEqual(result, queryURL, "Exchange Rate param did not update correctly");
        return shopInstance.setQueryURL(query2URL, {from: owner});
      })
      .then(txObj => {
        assert.strictEqual(txObj.logs[0].event, "LogSetQueryURL", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eSender, owner, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eQueryURL, query2URL, "Logs did not return correctly");
        return shopInstance.queryURL({from: owner});
      })
      .then(result => {
        assert.strictEqual(result, query2URL, "Exchange Rate param did not update correctly");
      });
      //end test
    });


    //test ownership functionality
    it("Should fail to set Ocraclize PriceType when not owner", function() {
      return expectedExceptionPromise(
          () => shopInstance.setOraclizePriceType(oraclizePriceType, {from: user01, gas: 3000000}),
          3000000);
      //end test
    });

    it("Should fail to set Query URL when not owner", function() {
      return expectedExceptionPromise(
          () => shopInstance.setQueryURL(queryURL, {from: user01, gas: 3000000}),
          3000000);
      //end test
    });

    //test pausable functionality
    it("Should fail to set Oraclize PriceType if paused", function() {
      return shopInstance.pause({from: owner})
      .then(() => {
        return shopInstance.paused({from: owner});
      })
      .then(result => {
        assert.isTrue(result, "Contract is not paused");
        return expectedExceptionPromise(
            () => shopInstance.setOraclizePriceType(oraclizePriceType, {from: user01, gas: 3000000}),
            3000000);
      });
      //end test
    });

    //test pausable functionality
    it("Should fail to set Query URL if paused", function() {
      return shopInstance.pause({from: owner})
      .then(() => {
        return shopInstance.paused({from: owner});
      })
      .then(result => {
        assert.isTrue(result, "Contract is not paused");
        return expectedExceptionPromise(
            () => shopInstance.setQueryURL(queryURL, {from: user01, gas: 3000000}),
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
        return shopInstance.deposit.call({from: owner, value: amount})
      })
      .then(result => {
        assert.isTrue(result, "Function call did not return true");
        return shopInstance.deposit({from: owner, value: amount});
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
        return web3.eth.getBalancePromise(shopInstance.address);
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
        return shopInstance.deposit.call({from: owner, value: amount})
      })
      .then(result => {
        assert.isTrue(result, "Function call did not return true");
        return shopInstance.deposit({from: owner, value: amount});
      })
      .then(txObj => {
        gasUsed = txObj.receipt.gasUsed;
        return web3.eth.getTransactionPromise(txObj.tx);
      })
      .then(tx => {
        gasPrice = tx.gasPrice;
        txFee = gasUsed * gasPrice;
        return shopInstance.withdraw(amount, {from: owner});
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
        return web3.eth.getBalancePromise(shopInstance.address);
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
          () => shopInstance.deposit({from: user01, value: amount, gas: 3000000}),
          3000000);
      //end test
    });

    it("Should fail to set withdraw if not owner", function() {
      return shopInstance.deposit({from: owner, value: amount})
      .then(() => {
      return expectedExceptionPromise(
          () => shopInstance.withdraw(amount, {from: user01, gas: 3000000}),
          3000000);
        });
      //end test
    });

    //test pausable functionality
    it("Should fail to deposit if paused", function() {
      return shopInstance.pause({from: owner})
      .then(() => {
        return shopInstance.paused({from: owner});
      })
      .then(result => {
        assert.isTrue(result, "Contract should be paused");
        return expectedExceptionPromise(
            () => shopInstance.deposit({from: user01, value: amount, gas: 3000000}),
            3000000);
      });
      //end test
    });

    it("Should fail to withdraw if paused", function() {
      return shopInstance.deposit({from: owner, value: amount})
      .then(() => {
        return shopInstance.pause({from: owner});
      })
      then(() => {
        return shopInstance.paused({from: owner});
      })
      .then(result => {
        assert.isTrue(result, "Contract should be paused");
        return expectedExceptionPromise(
            () => shopInstance.withdraw(amount, {from: user01, gas: 3000000}),
            3000000);
      });
      //end test
    });

    //end describe
  });
/**
  describe("Buying tokens from the Shop Contract", function() {
    var amount = 1000;
    var tokenAmount;
    var usdtethRate = 200;

    beforeEach(function() {
      return shopInstance.setETHXRateOverride(usdtethRate, {from: owner});
    });

    it("Should be able to buy tokens from the Shop", function() {
      //calculate token amount to be purchased
      //wei amount * ETH exchange rate per wei * inverse of exchangeRate
      //dollars per wei * 1 / exchange rate (i.e. dollars per token bit)
      tokenAmount = Math.round((amount * decimals * usdtethRate) / (decimals * exchangeRate));

      return shopInstance.buyToken({from: user01, value: amount})
      .then(txObj => {
        //console.log(JSON.stringify(tokenAmount, null, 4));
        //console.log(JSON.stringify(txObj, null, 4));
        assert.strictEqual(txObj.logs[0].event, "LogBuyToken", "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eSender, user01, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eValue.toNumber(), amount, "Logs did not return correctly");
        assert.strictEqual(txObj.logs[0].args.eTokenAmount.toNumber(), tokenAmount, "Logs did not return correctly");
        return shopInstance.getTokenBalance(user01, {From: owner});
      })
      .then(result => {
        assert.strictEqual(result.toNumber(), tokenAmount, "Token balance did not return correctly");
      });

      //end test
    });

    //end describe
  });
  **/
  it("Should not self destruct if not owner", function() {
    return expectedExceptionPromise(
        () => shopInstance.kill({from: user01, gas: 3000000}),
        3000000);
    //end test
  });

});
