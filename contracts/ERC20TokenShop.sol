pragma solidity ^0.4.24;

import '../openzeppelin-solidity/contracts/ownership/Ownable.sol';
import '../openzeppelin-solidity/contracts/lifecycle/Pausable.sol';
import '../openzeppelin-solidity/contracts/math/SafeMath.sol';

import "../ethereum-api/oraclizeAPI_0.4.25.sol";

interface Token {
  function totalSupply() external view returns (uint256);

  function balanceOf(address owner) external view returns (uint256);

  function name() external view returns(string);

  function symbol() external view returns(string);

  function decimals() external view returns(uint8);

  function allowance(address owner, address spender) external view returns (uint256);

  function transfer(address to, uint256 value) external returns (bool);

  function approve(address spender, uint256 value) external returns (bool);
}

contract ERC20TokenShop is Ownable, Pausable, usingOraclize {
  using SafeMath for uint256;

  Token tokenContract;

  uint256 public customGasLimit;
  uint256 public exchangeRate;
  uint256 public USDTETH;
  uint256 public oracleTax;

  string public queryURL;
  string public oraclizePriceType;

  event LogBuyToken(address eSender, uint256 eValue, uint256 eTokenAmount);
  event LogSetExchangeRate(address eSender, uint256 eRate, uint256 eExchangeRate);
  event LogSetETHXRateOverride(address eSender, uint256 eETHXRate);
  event LogSetOracleTaxOverride(address eSender, uint256 eOracleTax);
  event LogSetQueryURL(address eSender, string eQueryURL);
  event LogSetOraclizePriceType(address eSender, string eOraclizePriceType);
  event LogApproveBurn(address eRecipient, address eSender, uint256 eAmount);
  event LogDeposit(address eSender, uint256 eValue);
  event LogWithdraw(address eSender, uint256 eValue);
  event LogSetETHXUpdated(address eSender, string eETHXRate);
  event LogNewOraclizeQuery(string eOracleResponse);

  //Default exchange rate is $1/Token
  constructor(address _instance) public {
    tokenContract = Token(_instance);
    USDTETH = 200;
    exchangeRate = 1000000000000000000;
    customGasLimit = 100000;
    oraclizePriceType = "URL";
    queryURL = "json(https://api.gdax.com/products/ETH-USD/ticker).price";
  }

  //Token functions
  function getTokenSupply()
    public
    view
    returns (uint256)
  {
    return tokenContract.totalSupply();
  }

  function getTokenBalance(address _account)
    public
    view
    returns (uint256)
  {
    return tokenContract.balanceOf(_account);
  }

  function getTokenName()
    public
    view
    returns (string)
  {
    return tokenContract.name();
  }

  function getTokenSymbol()
    public
    view
    returns (string)
  {
    return tokenContract.symbol();
  }

  function getTokenDecimals()
    public
    view
    returns (uint8)
  {
    return tokenContract.decimals();
  }

  //User functions
  function buyToken()
    whenNotPaused
    public
    payable
    returns (bool)
  {
    require(msg.value > 0);
    require(tokenContract.balanceOf(address(this)) > 0);
    //check not asking for more than stock
    require(tokenContract.balanceOf(address(this)) >= msg.value.sub(oracleTax));
    //set Oracle Tax
    oracleTax = oraclize_getPrice(oraclizePriceType, customGasLimit); //URL
    //check value is at least 1 cross rate token bit unit per wei
    require(msg.value >= exchangeRate.mul(USDTETH).div(10**18).add(oracleTax));
    //get updated ETH USD cross rate
    updatePrice();
    //wei to token bit conversion via dollars
    //$ per ETH * ETH per wei * (1 / $ per tokenbit) = tokenbit per wei
    uint256 _amount;
    _amount = msg.value.sub(oracleTax).mul(exchangeRate).mul(USDTETH).div(10**(18));
    emit LogBuyToken(msg.sender, msg.value, _amount);
    tokenContract.transfer(msg.sender, _amount);
    return true;
  }

  //Oraclize implementation
  function __callback(bytes32 myid, string result) {
    require(msg.sender == oraclize_cbAddress());
    USDTETH = parseInt(result, 0);
    emit LogSetETHXUpdated(msg.sender, result);
  }

  //oraclize_query("URL", "json(https://api.gdax.com/products/ETH-USD/ticker).price")
  function updatePrice()
    whenNotPaused
    public
    payable
  {
      emit LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer...");
      oraclize_query(oraclizePriceType, queryURL, customGasLimit);
  }

  //Shop functions
  function getShopStock()
    public
    view
    returns (uint256)
  {
    return tokenContract.balanceOf(address(this));
  }

  function getOracleTax()
    public
    view
    returns (uint256)
  {
    return oracleTax;
  }

  //Exchange rate in Dollars (i.e. Tokens per dollar)
  function setExchangeRate(uint256 _dollars_per_token)
    onlyOwner
    whenNotPaused
    public
    returns (bool)
  {
    uint256 _decimals = getTokenDecimals();
    _decimals = 10**(_decimals);
    exchangeRate = _decimals.div(_dollars_per_token);
    emit LogSetExchangeRate(msg.sender, _dollars_per_token, exchangeRate);
    return true;
  }

  function setETHXRateOverride(uint256 _dollars_per_eth)
    onlyOwner
    whenNotPaused
    public
    returns (bool)
  {
    USDTETH = _dollars_per_eth;
    emit LogSetETHXRateOverride(msg.sender, _dollars_per_eth);
    return true;
  }

  function setOracleTaxOverride(uint256 _oracleTax)
    onlyOwner
    whenNotPaused
    public
    returns (bool)
  {
      oracleTax = _oracleTax;
      emit LogSetOracleTaxOverride(msg.sender, _oracleTax);
      return true;
  }

  function setQueryURL(string _url)
    onlyOwner
    whenNotPaused
    public
    returns (bool)
  {
    queryURL = _url;
    emit LogSetQueryURL(msg.sender, _url);
    return true;
  }

  function setOraclizePriceType(string _type)
    onlyOwner
    whenNotPaused
    public
    returns (bool)
  {
    oraclizePriceType = _type;
    emit LogSetOraclizePriceType(msg.sender, _type);
    return true;
  }

  function setGasLimit(uint256 _newGasLimit)
    onlyOwner
    whenNotPaused
    public
    returns (bool)
  {
    customGasLimit = _newGasLimit;
    return true;
  }

  function approveBurn(address _recipient, uint256 _amount)
    onlyOwner
    whenNotPaused
    public
    returns (bool)
 {
    emit LogApproveBurn(_recipient, msg.sender, _amount);
    tokenContract.approve(_recipient, _amount);
    return true;
 }

  function deposit()
    onlyOwner
    whenNotPaused
    payable
    public
    returns (bool)
  {
    emit LogDeposit(msg.sender, msg.value);
    return true;
  }

  function withdraw(uint256 _amount)
    onlyOwner
    whenNotPaused
    public
    returns (bool)
  {
    require(address(this).balance >= _amount);
    address _owner;
    _owner = owner();
    emit LogWithdraw(msg.sender, _amount);
    _owner.transfer(_amount);
    return true;
  }

  function kill()
    onlyOwner
    public
  {
    selfdestruct(owner());
  }


}
