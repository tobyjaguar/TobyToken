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
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogActions from '@material-ui/core/DialogActions'

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

class BurnToken extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts

    this.handleAmountInputChange = this.handleAmountInputChange.bind(this)
    this.handleDialogOpen = this.handleDialogOpen.bind(this)
    this.handleDialogBurnOpen = this.handleDialogBurnOpen.bind(this)
    this.handleDialogClose = this.handleDialogClose.bind(this)
    this.handleDialogBurnClose = this.handleDialogBurnClose.bind(this)
    this.handleBurnButton = this.handleBurnButton.bind(this)
    this.handleSetMaxButton = this.handleSetMaxButton.bind(this)
    this.setTXParamValue = this.setTXParamValue.bind(this)

    this.state = {
      dialogOpen: false,
      dialogBurnOpen: false,
      recipientAddress: '',
      burnAmount: '',
      weiAmount: '',
      alertText: ''
    }
  }

  componentDidMount() {
    this.setState({invalidAddress: false})
  }

  handleAmountInputChange(event) {
    this.setState({ [event.target.name]: event.target.value })
    this.setTXParamValue(event.target.value)
  }

  handleDialogOpen() {
    this.setState({ dialogOpen: true })
  }

  handleDialogBurnOpen() {
    this.setState({ dialogBurnOpen: true })
  }

  handleDialogClose() {
    this.setState({ dialogOpen: false })
  }

  handleDialogBurnClose() {
    this.setState({ dialogBurnOpen: false })
  }

  handleBurnButton() {
    if(this.state.weiAmount <= this.props.tknBalance) {
      this.handleDialogBurnClose()
      this.contracts.ERC20TobyToken.methods["burn"].cacheSend(this.state.weiAmount, {from: this.props.accounts[0]})
    } else if (this.state.weiAmount > this.props.tknBalance) {
      this.handleDialogBurnClose()
      this.setState({ alertText: 'Oops! You are trying to transfer more than you have.'})
      this.handleDialogOpen()
    } else {
      this.handleDialogBurnClose()
      this.setState({ alertText: 'Oops! Something went wrong. Try checking your transaction details.'})
      this.handleDialogOpen()
    }
  }

  handleSetMaxButton() {
    this.setState({
      burnAmount: this.props.tknBalance
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
    var transferGroomed = this.groomWei(this.state.burnAmount)

    return (
      <div>
        <Paper style={styles} elevation={5}>
          <p><strong>Name: </strong> <ContractData contract="ERC20TokenShop" method="getTokenName" /></p>

          <p><strong>Symbol: </strong> <ContractData contract="ERC20TokenShop" method="getTokenSymbol" /></p>
          <p>Balance: {this.props.tknBalance}</p>
          <p><Button type="Button" variant="contained" onClick={this.handleSetMaxButton}>Use Balance</Button></p>

          <form className="pure-form pure-form-stacked">
            <input name="burnAmount" type="text" placeholder="token bits to burn:" value={this.state.burnAmount} onChange={this.handleAmountInputChange} />
            <Button type="Button" variant="contained" onClick={this.handleDialogBurnOpen}>Burn</Button>
          </form>
          <p>Tokens to burn: {transferGroomed} </p>
      </Paper>

      <Dialog PaperProps={dialogStyles} open={this.state.dialogBurnOpen} >
        <DialogTitle>Destroying Tokens</DialogTitle>
          <p>WARNING!!! This will destroy your tokens</p>
        <DialogActions>
          <Button variant="contained" onClick={this.handleDialogBurnClose} >Cancel</Button>
          <Button variant="contained" onClick={this.handleBurnButton} >Burn 'em!</Button>
        </DialogActions>
      </Dialog>

      <Dialog PaperProps={dialogStyles} open={this.state.dialogOpen} >
        <p>{this.state.alertText}</p>
        <p><Button variant="contained" onClick={this.handleDialogClose} >Close</Button></p>
      </Dialog>
      </div>
    )
  }
}

BurnToken.contextTypes = {
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

export default drizzleConnect(BurnToken, mapStateToProps)
