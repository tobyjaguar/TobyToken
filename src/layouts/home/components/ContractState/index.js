import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'


class ContractState extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts


    this.state = {

    }
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {

  }



  render() {

    return (
      <div>
      <p>ETH Rate: {this.props.ethRate} </p>
      <p>Exchange Rate: {this.props.exchangeRate} </p>
      <p>Decimals: {this.props.tokenDecimals} </p>
      <p>Oracle Tax: {this.props.oracleTax}</p>
      </div>
    )
  }
}

ContractState.contextTypes = {
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

export default drizzleConnect(ContractState, mapStateToProps)
