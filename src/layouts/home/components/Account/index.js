import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

//components
import { AccountData } from 'drizzle-react-components'
import Paper from '@material-ui/core/Paper'

//inline styles
const styles = {
    backgroundColor: '#F9DBDB',
    padding: 20
}

class Account extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts

    this.handleInputChange = this.handleInputChange.bind(this)

  }

  handleInputChange(event) {
    this.setState({ [event.target.name]: event.target.value })
  }

  render() {

    return (
      <div>
        <Paper style={styles} elevation={5} >
        <h2>Active Account</h2>
        <AccountData accountIndex="0" units="ether" precision="4" />
        <p><strong>Token Balance: </strong> {this.props.tknBalance} TOBY</p>
        <br/>
      </Paper>
      </div>
    )

  }
}


Account.contextTypes = {
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

export default drizzleConnect(Account, mapStateToProps)
