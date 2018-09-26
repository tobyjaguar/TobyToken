import React, { Component } from 'react'
import { ContractData, ContractForm } from 'drizzle-react-components'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'
import web3 from 'web3'

//import store from '../../../../store'

class ShopItem extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts

    this.handleInputChange = this.handleInputChange.bind(this)
    this.setTXParamValue = this.setTXParamValue.bind(this)

    this.state = {
      dataKeyRate: null,
      dataKeyExchange: null,
      dataKeyDecimals: null,
      ethRate: 1,
      exchangeRate: 1,
      tokenDecimals: 1,
      weiAmount: '',
      purchaseAmount: 0,
      txReceipt: ''
    }
  }

  componentDidMount() {
    const dataKeyExchange = this.contracts.ERC20TokenStore.methods["exchangeRate"].cacheCall()
    const dataKeyRate = this.contracts.ERC20TokenStore.methods["USDTETH"].cacheCall()
    const dataKeyDecimals = this.contracts.ERC20TokenStore.methods["getTokenDecimals"].cacheCall()
    //const dataKeyEvents = this.contracts.ERC20TokenStore.methods["events"].cacheCall()
    this.setState({ dataKeyExchange, dataKeyRate, dataKeyDecimals })
  }

  componentDidUpdate(prevProps) {
    if (this.props.TokenShop !== prevProps.TokenShop) {
      if (this.props.TokenShop.USDTETH[this.state.dataKeyRate] !== undefined && prevProps.TokenShop.USDTETH[this.state.dataKeyRate] !== undefined) {
        this.setEthRate(this.props.TokenShop)
        this.setExchangeRate(this.props.TokenShop)
        this.setDecimals(this.props.TokenShop)
      }
    }

    if (this.props.transactions !== prevProps.transactions) {
      //switch over resonses
      this.setState({
        txReceipt: this.props.transactions
      })
    }
  }

  handleInputChange(event) {
    this.setState({ [event.target.name]: event.target.value })
    this.setTXParamValue(event.target.value)
    //this.fnTest(event.target.value)
  }

  handleSetButton() {
    this.contracts.SimpleStorage.methods.set(this.state.storageAmount).send()
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

  fnTest(_value) {
    var intVal = Number(_value)
    this.setState({weiAmount: intVal + 1})
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

  render() {

    //const contract = this.context.drizzle.store.getState().contracts.ERC20TokenStore
    //console.log(this.context.drizzle.store.getState())
    //console.log(this.state)
    //console.log(this.context.drizzle.contracts.ERC20TokenStore)
    //console.log(this.props)

    return (
      <div>
      <p><strong>Name: </strong> <ContractData contract="ERC20TokenStore" method="getTokenName" /></p>

      <p><strong>Symbol: </strong> <ContractData contract="ERC20TokenStore" method="getTokenSymbol" /></p>
      <p><strong>Store Stock: </strong> <ContractData contract="ERC20TokenStore" method="getStoreStock" /></p>

      <h3><p>Buy Tokens: </p></h3>
      <p>How many Tokens:</p>
      <form className="pure-form pure-form-stacked">
        <input name="purchaseAmount" type="number" value={this.state.purchaseAmount} onChange={this.handleInputChange} />
      </form>
      <br/><br/>
      <ContractForm contract="ERC20TokenStore" method="buyToken" sendArgs={[{from: this.props.accounts[0], value: this.state.weiAmount}]} />

      <p>State: </p>
      <p>ETH Rate: {this.state.ethRate} </p>
      <p>Exchange Rate: {this.state.exchangeRate} </p>
      <p>Decimals: {this.state.tokenDecimals} </p>
      <p>Wei Amount: {this.state.weiAmount} </p>
      <p>Purchase Amount: {this.state.purchaseAmount}</p>
      <p>txStatus: {this.state.txReceipt}</p>

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
    SimpleStorage: state.contracts.SimpleStorage,
    TutorialToken: state.contracts.TutorialToken,
    TobyToken: state.contracts.ERC20TobyToken,
    TokenShop: state.contracts.ERC20TokenStore,
    drizzleStatus: state.drizzleStatus,
    transactionStack: state.transactionStack,
    transactions: state.transactions
  }
}

export default drizzleConnect(ShopItem, mapStateToProps)
