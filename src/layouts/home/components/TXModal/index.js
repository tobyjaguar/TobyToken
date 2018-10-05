import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

//components
import Paper from '@material-ui/core/Paper'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

//inline styles
const styles = {
  style: {
    backgroundColor: '#FFF5F5',
    padding: 20
  }
}

class TXModal extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts

    this.handleOpen = this.handleOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)

    this.state = {
      open: false,
      txHash: '',
      txStatus: ''
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.transactions !== prevProps.transactions) {
      var stackId = this.props.transactionStack[this.props.transactionStack.length - 1]
      if (this.props.transactions[stackId] !== undefined) {
        if (stackId === undefined) {
          this.setState({
            open: true,
            txHash: this.props.transactions[stackId].error.message,
            txStatus: this.props.transactions[stackId].status
          })
        }
        else {
          this.setState({
            open: true,
            txHash: stackId,
            txStatus: this.props.transactions[stackId].status
          })
        }
      }
    }
  }

  handleOpen() {
    this.setState({ open: true })
  }

  handleClose() {
    this.setState({ open: false })
  }

  render() {

    return (
      <div>

        <Dialog PaperProps={styles} open={this.state.open} >
          <DialogTitle id="tx-dialog">Transaction:</DialogTitle>
          <List>
            <ListItem>
              <p>Status:</p>
              <ListItemText primary={this.state.txStatus} />
            </ListItem>
            <ListItem>
              <p>TxHash</p>
              <br/>
              <ListItemText secondary={this.state.txHash} />
            </ListItem>
            <ListItem>
              <Button variant="contained" onClick={this.handleClose} >Close</Button>
            </ListItem>
          </List>
        </Dialog>

      </div>
    )

  }
}


TXModal.contextTypes = {
  drizzle: PropTypes.object
}

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    TokenShop: state.contracts.ERC20TokenShop,
    drizzleStatus: state.drizzleStatus,
    transactionStack: state.transactionStack,
    transactions: state.transactions
  }
}

export default drizzleConnect(TXModal, mapStateToProps)
