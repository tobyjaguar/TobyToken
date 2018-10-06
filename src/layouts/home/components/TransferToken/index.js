import React, { Component } from 'react'
import { ContractData } from 'drizzle-react-components'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'
import web3 from 'web3'

//components
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'

//inline styles
const styles = {
    backgroundColor: '#F9DBDB',
    padding: 20

}

class TransferToken extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts

    this.handleRecipientInputChange = this.handleRecipientInputChange.bind(this)
    this.handleAmountInputChange = this.handleAmountInputChange.bind(this)
    this.handleTransferButton = this.handleTransferButton.bind(this)
    this.handleSetMaxButton = this.handleSetMaxButton.bind(this)
    this.setTXParamValue = this.setTXParamValue.bind(this)

    this.state = {
      recipientAddress: '',
      transferAmount: '',
      weiAmount: ''
    }
  }

  componentDidMount() {

  }

  handleRecipientInputChange(event) {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleAmountInputChange(event) {
    this.setState({ [event.target.name]: event.target.value })
    this.setTXParamValue(event.target.value)
  }

  handleTransferButton() {
    this.contracts.ERC20TobyToken.methods["transfer"].cacheSend(this.state.recipientAddress, this.state.weiAmount, {from: this.props.accounts[0]})
  }
  handleSetMaxButton() {
    this.setState({
      transferAmount: this.props.tknBalance
    })
  }

  setTXParamValue(_value) {
    var BN = web3.utils.BN
    var tokenAmount = new BN(_value)
    //var tokenDecimals = Math.pow(10,Number(this.state.tokenDecimals))
    //var tokenBits = web3.utils.toBN(tokenDecimals)
    this.setState({
      weiAmount: tokenAmount.toString()
    })
  }

  groomWei(weiValue) {
    var factor = Math.pow(10, 4)
    var balance = this.context.drizzle.web3.utils.fromWei(weiValue)
    balance = Math.round(balance * factor) / factor
    return balance
  }

  render() {
    //var sendAmountGroomed = this.groomWei(this.state.weiAmount)

    return (
      <div>
        <Paper style={styles} elevation={5}>
          <p><strong>Name: </strong> <ContractData contract="ERC20TokenShop" method="getTokenName" /></p>

          <p><strong>Symbol: </strong> <ContractData contract="ERC20TokenShop" method="getTokenSymbol" /></p>
          <p>Balance: {this.props.tknBalance}</p>
          <p><Button type="Button" variant="contained" onClick={this.handleSetMaxButton}>Use Balance</Button></p>

          <form className="pure-form pure-form-stacked">
            <input name="recipientAddress" type="text" placeholder="Send to:" value={this.state.recipientAddress} onChange={this.handleRecipientInputChange} />
            <input name="transferAmount" type="text" placeholder="token bits to send:" value={this.state.transferAmount} onChange={this.handleAmountInputChange} />
            <Button type="Button" variant="contained" onClick={this.handleTransferButton}>Transfer</Button>
          </form>

      </Paper>
      </div>
    )
  }
}

TransferToken.contextTypes = {
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

export default drizzleConnect(TransferToken, mapStateToProps)
