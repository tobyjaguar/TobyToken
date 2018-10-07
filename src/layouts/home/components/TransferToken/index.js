import React, { Component } from 'react'
import { ContractData } from 'drizzle-react-components'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'
import web3 from 'web3'

//components
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
//import InvalidAddressModal from '../InvalidAddressModal'
import Dialog from '@material-ui/core/Dialog'

//inline styles
const styles = {
    backgroundColor: '#F9DBDB',
    padding: 20
}

const dialogStyles = {
  style: {
    backgroundColor: '#F9DBDB',
    padding: 20
  }
}

class TransferToken extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts

    this.handleRecipientInputChange = this.handleRecipientInputChange.bind(this)
    this.handleAmountInputChange = this.handleAmountInputChange.bind(this)
    this.handleDialogOpen = this.handleDialogOpen.bind(this)
    this.handleDialogClose = this.handleDialogClose.bind(this)
    this.handleTransferButton = this.handleTransferButton.bind(this)
    this.handleSetMaxButton = this.handleSetMaxButton.bind(this)
    this.setTXParamValue = this.setTXParamValue.bind(this)

    this.state = {
      dialogOpen: false,
      recipientAddress: '',
      transferAmount: '',
      weiAmount: ''
    }
  }

  componentDidMount() {
    this.setState({invalidAddress: false})
  }

  handleRecipientInputChange(event) {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleAmountInputChange(event) {
    this.setState({ [event.target.name]: event.target.value })
    this.setTXParamValue(event.target.value)
  }

  handleDialogOpen() {
    this.setState({ dialogOpen: true })
  }

  handleDialogClose() {
    this.setState({ dialogOpen: false })
  }

  handleTransferButton() {
    if(this.context.drizzle.web3.utils.isAddress(this.state.recipientAddress)) {
      this.contracts.ERC20TobyToken.methods["transfer"].cacheSend(this.state.recipientAddress, this.state.weiAmount, {from: this.props.accounts[0]})
    } else {
      this.handleDialogOpen()
    }
  }

  handleSetMaxButton() {
    this.setState({
      transferAmount: this.props.tknBalance
    })
  }

  setTXParamValue(_value) {
    if (_value.match(/^[0-9]{1,40}$/)){
      var BN = web3.utils.BN
      var tokenAmount = new BN(_value)
      //var tokenDecimals = Math.pow(10,Number(this.state.tokenDecimals))
      //var tokenBits = web3.utils.toBN(tokenDecimals)
      this.setState({
        weiAmount: tokenAmount.toString()
      })
    }
    else {
      this.setState({
        weiAmount: "0"
      })
    }
  }

  groomWei(weiValue) {
    if (weiValue.match(/^[0-9]{1,40}$/)){
      var factor = Math.pow(10, 18)
      var balance = this.context.drizzle.web3.utils.fromWei(weiValue)
      balance = Math.round(balance * factor) / factor
      return balance
    }
    else {
      //return "Oops! Check the transfer amount. Nothing will be sent."
    }
  }

  render() {
    var transferGroomed = this.groomWei(this.state.transferAmount)

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
          <p>Tokens to transfer: {transferGroomed} </p>
      </Paper>

      <Dialog PaperProps={dialogStyles} open={this.state.dialogOpen} >
        <p>"Oops! The receipient address isn't a correct ethereum address."</p>
        <p><Button variant="contained" onClick={this.handleDialogClose} >Close</Button></p>
      </Dialog>
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
