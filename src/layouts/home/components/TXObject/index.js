import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

//import store from '../../../../store'

class TXObject extends Component {
  constructor(props, context) {
    super(props)

  }

  componentDidUpdate(prevProps) {
    if (this.props.transactionStack !== prevProps.transactionStack)
     {
       //this.updateTxHashArray()
     }
  }

  updateTxHashArray() {
    //this logic doesn't work
    var hashArray = this.state.txHashArray
    var hashArrayLength = hashArray.length
    if (hashArrayLength-1 !== undefined) {
      hashArray.push(this.props.transactionStack[hashArrayLength-1])
    }
  }


  render() {
    return (
      <div className="pure-u-1-1">
        <p>txHash: {this.props.txHash}</p>
        <p>txStatus: {this.props.txStatus}</p>
      </div>
    )
  }
}

TXObject.contextTypes = {
  drizzle: PropTypes.object
}

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    TokenShop: state.contracts.ERC20TokenStore,
    drizzleStatus: state.drizzleStatus,
    transactionStack: state.transactionStack,
    transactions: state.transactions
  }
}

export default drizzleConnect(TXObject, mapStateToProps)
