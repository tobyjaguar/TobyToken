import React, { Component } from 'react'
import { ContractData, ContractForm } from 'drizzle-react-components'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'


class Admin extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts

    this.handleInputChange = this.handleInputChange.bind(this)

    this.state = {
      dataKeyStock: null,
      shopStock: 0,
      depositAmount: 0
    }
  }

  componentDidMount() {
    const dataKeyStock = this.contracts.ERC20TokenShop.methods["getShopStock"].cacheCall()
    this.setState({dataKeyStock})
    this.setShopStock(this.props.TokenShop)
  }

  componentDidUpdate(prevProps) {
    if (this.props.TokenShop !== prevProps.TokenShop) {
        this.setShopStock(this.props.TokenShop)
    }
  }

  handleInputChange(event) {
    this.setState({ [event.target.name]: event.target.value })
  }

  setShopStock(contract) {
    if (contract.getShopStock[this.state.dataKeyStock] !== undefined && this.state.dataKeyStock !== null) {
      this.setState({
        shopStock: contract.getShopStock[this.state.dataKeyStock].value
      })
    }
  }

  render() {

    return (
      <div>
        <h2>Admin</h2>
        <p>Shop Address: {this.contracts.ERC20TokenShop.address} </p>
        <p>Token Address: {this.contracts.ERC20TobyToken.address} </p>

        <p><strong>Name: </strong> <ContractData contract="ERC20TokenShop" method="getTokenName" /></p>

        <p><strong>Symbol: </strong> <ContractData contract="ERC20TokenShop" method="getTokenSymbol" /></p>
        <p><strong>Store Stock: </strong> {this.state.shopStock}</p>
        <p><strong>Exchange Rate: </strong> <ContractData contract="ERC20TokenShop" method="exchangeRate" /></p>
        <p><strong>ETH Cross Rate: </strong> <ContractData contract="ERC20TokenShop" method="USDTETH" /></p>

        <h3><p>Store Stats</p></h3>
        <strong>Set Exchange Rate: </strong>
        <div><ContractForm contract="ERC20TokenShop" method="setExchangeRate" labels={['Dollars per Token']} /></div>
        <br/>
        <strong>Set ETH Exchange Rate: </strong>
        <div><ContractForm contract="ERC20TokenShop" method="setETHXRate" labels={['Dollars per ETH']} /></div>
        <br/>
        <strong>Withdraw: </strong>
        <div><ContractForm contract="ERC20TokenShop" method="withdraw" labels={['Amount']} /></div>
        <br/>

        <h3>Deposit</h3>
        <p>Add funds</p>
        <form className="pure-form pure-form-stacked">
          <input name="depositAmount" type="number" value={this.state.depositAmount} onChange={this.handleInputChange} />
        </form>
        <ContractForm contract="ERC20TokenShop" method="deposit" sendArgs={{from: this.props.accounts[0], value: this.state.depositAmount}} />

        <h3>Get Oracle</h3>
        <p>Ask the oracle for the price</p>
        <ContractForm contract="ERC20TokenShop" method="updatePrice" />

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
    TobyToken: state.contracts.ERC20TobyToken,
    TokenShop: state.contracts.ERC20TokenShop,
    drizzleStatus: state.drizzleStatus
  }
}

export default drizzleConnect(Admin, mapStateToProps)
