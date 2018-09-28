pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/lifecycle/Pausable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

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

contract ERC20TokenShop is Ownable, Pausable {
  using SafeMath for uint256;

  Token tokenContract;

  uint256 public exchangeRate;
  uint256 public USDTETH;

  event LogBuyToken(address eSender, uint256 eValue, uint256 eTokenAmount);
  event LogSetExchangeRate(address eSender, uint256 eRate, uint256 eExchangeRate);
  event LogSetETHXRate(address eSender, uint256 eETHXRate);
  event LogDeposit(address eSender, uint256 eValue);
  event LogWithdraw(address eSender, uint256 eValue);

  //Default exchange rate is $1/Token
  constructor(address _instance) public {
    tokenContract = Token(_instance);
    exchangeRate = 1000000000000000000;
  }

  //Token functions
  function getTokenSupply() public view returns (uint256) {
    return tokenContract.totalSupply();
  }

  function getTokenBalance(address _account) public view returns (uint256) {
    return tokenContract.balanceOf(_account);
  }

  function getTokenName() public view returns (string) {
    return tokenContract.name();
  }

  function getTokenSymbol() public view returns (string) {
    return tokenContract.symbol();
  }

  function getTokenDecimals() public view returns (uint8) {
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
    require(tokenContract.balanceOf(address(this)) >= msg.value);
    //check value is at least 1 cross rate token bit unit per wei
    require(msg.value >= exchangeRate.mul(USDTETH).div(10**18));
    //wei to token bit conversion via dollars
    //$ per ETH * ETH per wei * (1 / $ per tokenbit) = tokenbit per wei
    uint256 _amount;
    _amount = msg.value.mul(exchangeRate).mul(USDTETH).div(10**(18));
    emit LogBuyToken(msg.sender, msg.value, _amount);
    tokenContract.transfer(msg.sender, _amount);
    return true;
  }

  //Shop functions
  function getShopStock() public view returns (uint256) {
    return tokenContract.balanceOf(address(this));
  }

  //Exchange rate in Dollars (i.e. Tokens per dollar)
  function setExchangeRate(uint256 _dollars_per_token)
  onlyOwner
  whenNotPaused
  public
  returns (bool)
  {
    _setExchangeRate(_dollars_per_token);
    return true;
  }

  function setETHXRate(uint256 _dollars_per_eth)
  onlyOwner
  whenNotPaused
  public
  returns (bool)
  {
    _setETHXRate(_dollars_per_eth);
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

  //Internal functions
  function _setExchangeRate(uint256 _dollars_per_token)
  whenNotPaused
  internal
  returns (bool)
  {
    uint256 _decimals = getTokenDecimals();
    _decimals = 10**(_decimals);
    exchangeRate = _decimals.div(_dollars_per_token);
    emit LogSetExchangeRate(msg.sender, _dollars_per_token, exchangeRate);
    return true;
  }

  function _setETHXRate(uint256 _dollars_per_eth)
  whenNotPaused
  internal
  returns (bool)
  {
    USDTETH = _dollars_per_eth;
    emit LogSetETHXRate(msg.sender, _dollars_per_eth);
    return true;
  }


}
