import React, { Component } from 'react'
import { ContractData, ContractForm } from 'drizzle-react-components'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'
import web3 from 'web3'

//components
import Button from '@material-ui/core/Button'

class ShopItem extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts

    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleBuyButton = this.handleBuyButton.bind(this)
    this.setTXParamValue = this.setTXParamValue.bind(this)

    this.state = {
      dataKeyRate: null,
      dataKeyExchange: null,
      dataKeyDecimals: null,
      dataKeyStock: null,
      ethRate: 1,
      exchangeRate: 1,
      tokenDecimals: 1,
      shopStock: 0,
      weiAmount: '',
      purchaseAmount: 0
    }
  }

  componentDidMount() {
    const dataKeyExchange = this.contracts.ERC20TokenShop.methods["exchangeRate"].cacheCall()
    const dataKeyRate = this.contracts.ERC20TokenShop.methods["USDTETH"].cacheCall()
    const dataKeyDecimals = this.contracts.ERC20TokenShop.methods["getTokenDecimals"].cacheCall()
    const dataKeyStock = this.contracts.ERC20TokenShop.methods["getShopStock"].cacheCall()
    //const dataKeyEvents = this.contracts.ERC20TokenShop.methods["events"].cacheCall()

    this.setState({ dataKeyExchange, dataKeyRate, dataKeyDecimals, dataKeyStock })

    if (this.props.TokenShop.getShopStock[this.state.dataKeyStock] !== undefined) {
      this.setShopStock(this.props.TokenShop)
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.TokenShop !== prevProps.TokenShop) {
      if (this.props.TokenShop.USDTETH[this.state.dataKeyRate] !== undefined && prevProps.TokenShop.USDTETH[this.state.dataKeyRate] !== undefined) {
        this.setEthRate(this.props.TokenShop)
        this.setExchangeRate(this.props.TokenShop)
        this.setDecimals(this.props.TokenShop)
        this.setShopStock(this.props.TokenShop)
      }
    }
  }

  handleInputChange(event) {
    this.setState({ [event.target.name]: event.target.value })
    this.setTXParamValue(event.target.value)
    //this.fnTest(event.target.value)
  }

  handleBuyButton(event) {
    this.contracts.ERC20TokenShop.methods["buyToken"].cacheSend({from: this.props.accounts[0], value: this.state.weiAmount})
  }

  setTXParamValue(_value) {
    var BN = web3.utils.BN
    var weiDecimal = new BN(web3.utils.toWei('1', 'ether'))
    var tokenAmount = new BN(_value)
    var exchangeRate = new BN(this.state.exchangeRate)
    var ethXRate = new BN(this.state.ethRate)
    var tokenDecimals = Math.pow(10,Number(this.state.tokenDecimals))
    //console.log(web3.utils.toBN(tokenDecimals).toString())
    //console.log(web3.utils.isBN(web3.utils.toBN(tokenDecimals)))
    var tokenBits = web3.utils.toBN(tokenDecimals)

    this.setState({
      weiAmount: exchangeRate.mul(weiDecimal).mul(tokenAmount).div(ethXRate).div(tokenBits).toString()
    })
  }

  setEthRate(contract) {
    if (contract.USDTETH[this.state.dataKeyRate] !== undefined && this.state.dataKeyRate !== null) {
      this.setState({
        ethRate: contract.USDTETH[this.state.dataKeyRate].value
      })
    }
  }

  setExchangeRate(contract) {
    if (contract.exchangeRate[this.state.dataKeyExchange] !== undefined && this.state.dataKeyExchange !== null) {
      this.setState({
        exchangeRate: contract.exchangeRate[this.state.dataKeyExchange].value
      })
    }
  }

  setDecimals(contract) {
    if (contract.getTokenDecimals[this.state.dataKeyDecimals] !== undefined && this.state.dataKeyDecimals !== null) {
      this.setState({
        tokenDecimals: contract.getTokenDecimals[this.state.dataKeyDecimals].value
      })
    }
  }

  setShopStock(contract) {
    if (contract.getShopStock[this.state.dataKeyStock] !== undefined && this.state.dataKeyStock !== null) {
      this.setState({
        shopStock: contract.getShopStock[this.state.dataKeyStock].value
      })
    }
  }

  render() {
    //const contract = this.context.drizzle.store.getState().contracts.ERC20TokenShop
    //console.log(this.context.drizzle.store.getState())
    //console.log(this.state)
    //console.log(this.context.drizzle.contracts.ERC20TokenShop)
    //console.log(this.props.transactions)
    //console.log(this.contracts.ERC20TokenShop.methods.getShopStock().call())

    return (
      <div>
      <p><strong>Name: </strong> <ContractData contract="ERC20TokenShop" method="getTokenName" /></p>

      <p><strong>Symbol: </strong> <ContractData contract="ERC20TokenShop" method="getTokenSymbol" /></p>
      <p><strong>Store Stock: </strong> {this.state.shopStock}</p>

      <h3><p>Buy Tokens: </p></h3>
      <p>Dollar amount of Tokens:</p>
      <form className="pure-form pure-form-stacked">
        <input name="purchaseAmount" type="number" value={this.state.purchaseAmount} onChange={this.handleInputChange} />
        <Button type="Button" variant="contained" onClick={this.handleBuyButton}>Buy</Button>
      </form>
      <br/><br/>
      {/*
      <ContractForm contract="ERC20TokenShop" method="buyToken" sendArgs={{from: this.props.accounts[0], value: this.state.weiAmount}} />
      */}


      <p>State: </p>
      <p>ETH Rate: {this.state.ethRate} </p>
      <p>Exchange Rate: {this.state.exchangeRate} </p>
      <p>Decimals: {this.state.tokenDecimals} </p>
      <p>Wei Amount: {this.state.weiAmount} </p>
      <p>Purchase Amount: {this.state.purchaseAmount}</p>

      </div>
    )
  }
}

ShopItem.contextTypes = {
  drizzle: PropTypes.object
}

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    TobyToken: state.contracts.ERC20TobyToken,
    TokenShop: state.contracts.ERC20TokenShop,
    drizzleStatus: state.drizzleStatus,
    transactionStack: state.transactionStack,
    transactions: state.transactions
  }
}

export default drizzleConnect(ShopItem, mapStateToProps)
