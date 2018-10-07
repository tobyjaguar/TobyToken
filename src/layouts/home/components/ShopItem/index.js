import React, { Component } from 'react'
import { ContractData } from 'drizzle-react-components'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'
import web3 from 'web3'

//components
import Button from '@material-ui/core/Button'
import ContractState from '../ContractState'
import Paper from '@material-ui/core/Paper'

//inline styles
const styles = {
    backgroundColor: '#F9DBDB',
    padding: 20

}

class ShopItem extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts

    this.handleShowStateButton = this.handleShowStateButton.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleBuyButton = this.handleBuyButton.bind(this)
    this.setTXParamValue = this.setTXParamValue.bind(this)

    this.state = {
      dataKeyRate: null,
      dataKeyExchange: null,
      dataKeyDecimals: null,
      dataKeyStock: null,
      dataKeyTax: null,
      showContractState: false,
      ethRate: "1",
      exchangeRate: "1",
      tokenDecimals: "1",
      shopStock: "0",
      oracleTax: "0",
      weiAmount: '',
      purchaseAmount: "0"
    }
  }

  componentDidMount() {
    const dataKeyExchange = this.contracts.ERC20TokenShop.methods["exchangeRate"].cacheCall()
    const dataKeyRate = this.contracts.ERC20TokenShop.methods["USDTETH"].cacheCall()
    const dataKeyDecimals = this.contracts.ERC20TokenShop.methods["getTokenDecimals"].cacheCall()
    const dataKeyStock = this.contracts.ERC20TokenShop.methods["getShopStock"].cacheCall()
    const dataKeyTax = this.contracts.ERC20TokenShop.methods["getOracleTax"].cacheCall()
    //const dataKeyEvents = this.contracts.ERC20TokenShop.methods["events"].cacheCall()

    this.setState({ dataKeyExchange, dataKeyRate, dataKeyDecimals, dataKeyStock, dataKeyTax })

  }

  componentDidUpdate(prevProps) {
    if (this.props.TokenShop !== prevProps.TokenShop || this.state.ethRate === "1") {
      if (this.props.TokenShop.USDTETH[this.state.dataKeyRate] !== undefined && prevProps.TokenShop.USDTETH[this.state.dataKeyRate] !== undefined) {
        this.setEthRate(this.props.TokenShop)
        this.setExchangeRate(this.props.TokenShop)
        this.setDecimals(this.props.TokenShop)
        this.setShopStock(this.props.TokenShop)
        this.getOracleTaxRate(this.props.TokenShop)
      }
    }
  }

  handleInputChange(event) {
    this.setState({ [event.target.name]: Math.abs(Math.round(Math.ceil(event.target.value))) })
    this.setTXParamValue(Math.abs(Math.round(Math.ceil(event.target.value))))
  }

  handleShowStateButton(event) {
    this.setState({ showContractState: !this.state.showContractState })
  }

  handleBuyButton(event) {
    this.contracts.ERC20TokenShop.methods["buyToken"].cacheSend({from: this.props.accounts[0], value: this.state.weiAmount})
  }

  setTXParamValue(_value) {
    this.getOracleTaxRate()
    var BN = web3.utils.BN
    var weiDecimal = new BN(web3.utils.toWei('1', 'ether'))
    var tokenAmount = new BN(_value)
    var exchangeRate = new BN(this.state.exchangeRate)
    var oracleTax = new BN(this.state.oracleTax)
    var tokenDecimals = Math.pow(10,Number(this.state.tokenDecimals))
    var ethXRate = new BN(this.state.ethRate)
    var tokenBits = web3.utils.toBN(tokenDecimals)
    if (ethXRate.toNumber() === 0) {
      ethXRate = web3.utils.toBN(1)
    }
    this.setState({
      weiAmount: exchangeRate.mul(weiDecimal).mul(tokenAmount).div(ethXRate).div(tokenBits).add(oracleTax).toString()
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

  getOracleTaxRate() {
    if (this.props.TokenShop.getOracleTax[this.state.dataKeyTax] !== undefined && this.state.dataKeyTax !== null) {
      this.setState({
        oracleTax: this.props.TokenShop.getOracleTax[this.state.dataKeyTax].value
      })
    }
  }

  groomWei(weiValue) {
    var factor = Math.pow(10, 4)
    var balance = this.context.drizzle.web3.utils.fromWei(weiValue)
    balance = Math.round(balance * factor) / factor
    return balance
  }

  render() {

    var oracleTaxGroomed = this.groomWei(this.state.oracleTax)
    var shopStockGroomed = this.groomWei(this.state.shopStock)
    var sendAmountGroomed = this.groomWei(this.state.weiAmount)

    var contractInfo
    if (this.state.showContractState) {
      contractInfo =
        <ContractState
          ethRate={this.state.ethRate}
          exchangeRate={this.state.exchangeRate}
          tokenDecimals={this.state.tokenDecimals}
          oracleTax={this.state.oracleTax}
        />
    }
    return (
      <div>
        <Paper style={styles} elevation={5}>
          <p><strong>Name: </strong> <ContractData contract="ERC20TokenShop" method="getTokenName" /></p>

          <p><strong>Symbol: </strong> <ContractData contract="ERC20TokenShop" method="getTokenSymbol" /></p>
          <p><strong>Store Stock: </strong> {shopStockGroomed}</p>

          <h3><p>Buy Tokens: </p></h3>
          <p>Dollar amount of Tokens:</p>
          <form className="pure-form pure-form-stacked">
            <input name="purchaseAmount" type="number" value={this.state.purchaseAmount} onChange={this.handleInputChange} />
            <Button type="Button" variant="contained" onClick={this.handleBuyButton}>Buy</Button>
          </form>
          <p>Minimum $1. Dollar values are rounded up to the next whole dollar.</p>
          <p>The oracle charges {oracleTaxGroomed} Ether to get the exchange rate </p>

      {/*
      <ContractForm contract="ERC20TokenShop" method="buyToken" sendArgs={{from: this.props.accounts[0], value: this.state.weiAmount}} />
      */}
        <p>Total: {sendAmountGroomed} ETH </p>
        <p>Purchase Amount: {this.state.purchaseAmount} TOBY </p>
        <br/>
        <Button type="Button" variant="contained" onClick={this.handleShowStateButton}>More Info</Button>
        {contractInfo}
      </Paper>
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
