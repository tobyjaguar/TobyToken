import React, { Component } from 'react'
import { ContractData, ContractForm } from 'drizzle-react-components'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

//import store from '../../../../store'

class ShopItem extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts
    //this.store = context.drizzle.store.getState()

    this.handleInputChange = this.handleInputChange.bind(this)
    this.setTXParamValue = this.setTXParamValue.bind(this)

    this.state = {
      ethRate: 1,
      exchangeRate: 1,
      tokenDecimals: 1,
      tokenAmount: 0,
      purchaseAmount: 0
    }
  }

  componentDidMount() {
    /**
    this.setState({
      exchangeRate: <ContractData contract="ERC20TokenStore" method="exchangeRate" />,
      ethRate: <ContractData contract="ERC20TokenStore" method="USDTETH" />,
      tokenDecimals: <ContractData contract="ERC20TokenStore" method="getTokenDecimals" />
    })
    **/
  }

  componentDidUpdate(prevState) {
    /**
    if (this.state.tokenAmount !== prevState.tokenAmount) {
      //console.log(this.state.tokenAmount)
      //this.setTXParamValue()
      //console.log(this.state.purchaseAmount)
    }
    **/
  }

  handleInputChange(event) {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleSetButton() {
    this.contracts.SimpleStorage.methods.set(this.state.storageAmount).send()
  }

  setTXParamValue() {
      var weiDecimal = Math.pow(10,18)
      this.setState({
        purchaseAmount: (((this.state.exchangeRate * weiDecimal * this.state.tokenAmount) / this.state.ethRate) / this.state.tokenDecimals)
      })


  }

  render() {
    //console.log(this.props)
    //var dataKey = this.props.drizzleStatus.initialized ? this.contracts.ERC20TokenStore.methods.exchangeRate.cacheCall() : 'Loading...'
    //console.log(this.context.drizzle.contracts.ERC20TokenStore.methods.getTokenDecimals().call())
    /**
    this.context.drizzle.contracts.ERC20TokenStore.methods.getTokenDecimals().call()
    .then(result => {
      console.log(result)
    })
    **/

    console.log(this.state)
    return (
      <div>
      <p><strong>Name: </strong> <ContractData contract="ERC20TokenStore" method="getTokenName" /></p>

      <p><strong>Symbol: </strong> <ContractData contract="ERC20TokenStore" method="getTokenSymbol" /></p>
      <p><strong>Store Stock: </strong> <ContractData contract="ERC20TokenStore" method="getStoreStock" /></p>

      <h3><p>Buy Tokens: </p></h3>
      <p>How many Tokens:</p>
      <form className="pure-form pure-form-stacked">
        <input name="purchaseAmount" type="number" value={this.state.tokenAmount} onChange={this.handleInputChange} />
      </form>
      <br/><br/>
      <ContractForm contract="ERC20TokenStore" method="buyToken" sendArgs={[{from: this.props.accounts[0]}]} />

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
    drizzleStatus: state.drizzleStatus
  }
}

export default drizzleConnect(ShopItem, mapStateToProps)
