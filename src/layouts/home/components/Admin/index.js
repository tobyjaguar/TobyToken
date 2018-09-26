import React, { Component } from 'react'
import { AccountData, ContractData, ContractForm } from 'drizzle-react-components'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'


class Admin extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts

    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleSetButton = this.handleSetButton.bind(this)

    this.state = {
      txMintParams: {}
    }
  }

  componentDidMount() {
    this.setState({
      txMintParams: "from:" + this.props.accounts[0].toString()
    })
  }

  handleInputChange(event) {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleSetButton() {
    this.contracts.SimpleStorage.methods.set(this.state.storageAmount).send()
  }

  render() {
    //var storedData = this.props.drizzleStatus.initialized ? this.contracts.SimpleStorage.methods.storedData.data() : 'Loading...'
    //console.log(tokenName)
    //console.log(this.props)
    //console.log(this.contracts.ERC20TobyToken)
    //console.log(this.state.txParams)
    //sendArgs={[{from: this.props.accounts[0]}]}
    return (
      <div>
      <p><strong>Name: </strong> <ContractData contract="ERC20TokenStore" method="getTokenName" /></p>

      <p><strong>Symbol: </strong> <ContractData contract="ERC20TokenStore" method="getTokenSymbol" /></p>
      <p><strong>Store Stock: </strong> <ContractData contract="ERC20TokenStore" method="getStoreStock" /></p>
      <p><strong>Exchange Rate: </strong> <ContractData contract="ERC20TokenStore" method="exchangeRate" /></p>
      <p><strong>Exchange Rate: </strong> <ContractData contract="ERC20TokenStore" method="USDTETH" /></p>

      <h3><p>Store Stats</p></h3>
      <strong>Set Stock: </strong>
      <div><ContractForm contract="ERC20TokenStore" method="setStoreStock" /></div>
      <br/>
      <strong>Set Exchange Rate: </strong>
      <div><ContractForm contract="ERC20TokenStore" method="setExchangeRate" labels={['Dollars per Token']} /></div>
      <br/>
      <strong>Set ETH Exchange Rate: </strong>
      <div><ContractForm contract="ERC20TokenStore" method="setETHXRate" labels={['Dollars per ETH']} /></div>
      <br/>
      <strong>Withdraw: </strong>
      <div><ContractForm contract="ERC20TokenStore" method="withdraw" labels={['Amount']} /></div>
      <br/>

      <h3><p>Allocate Tokens to the Shop: </p></h3>
      <p>Mint Tokens to the store:</p>
      <ContractForm contract="ERC20TobyToken" method="mint" labels={['Recipient', 'Amount to Mint']} />

      <h3>Burn Tokens</h3>
      <p>Burn your tokens.</p>
      <ContractForm contract="ERC20TobyToken" method="burn" labels={['Amount to Burn']} />
    </div>
    )

  }
}


Admin.contextTypes = {
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

export default drizzleConnect(Admin, mapStateToProps)
