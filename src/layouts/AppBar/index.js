import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'

//Styles
import '../../css/oswald.css'
import '../../css/open-sans.css'
import '../../css/pure-min.css'
import '../../App.css'

//inline styles
const style01 = {
  backgroundColor: '#F9DBDB',
  color: 'black',
  fontFamily: "'Open Sans', sans-serif",
  fontSize: "14pt"
}

const style02 = {
  color: 'black',
  fontFamily: "'Open Sans', sans-serif",
  fontSize: "14pt",
  marginLeft: 'auto'
}

class MyAppBar extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts

    this.state = {
        dataKeyTknBalance: null,
        tokenBalance: ''
    }
  }

  componentDidMount() {
    const dataKeyTknBalance = this.contracts.ERC20TokenShop.methods["getTokenBalance"].cacheCall(this.props.accounts[0])
    this.setState({dataKeyTknBalance})
    this.setTokenBalance()
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.TokenShop !== prevProps.TokenShop || this.state.TokenShop !== prevState.TokenShop) {
      this.setTokenBalance()
    }
  }

  setTokenBalance() {
    if (this.props.TokenShop.getTokenBalance[this.state.dataKeyTknBalance] !== undefined && this.state.dataKeyTknBalance !== null) {
      this.setState({
        tokenBalance: this.props.TokenShop.getTokenBalance[this.state.dataKeyTknBalance].value
      })
    }
  }

  groomWei(weiValue) {
    //y.toFormat(2)
    var factor = Math.pow(10, 4)
    var balance = this.context.drizzle.web3.utils.fromWei(weiValue)
    balance = Math.round(balance * factor) / factor
    return balance
  }

  render() {
    var tknBalanceGroomed = this.groomWei(this.state.tokenBalance)

    return (
          <AppBar style={style01} position="static">
            <Toolbar>
              <Typography style={style01} variant="title" color="inherit">
                  Contract Address: {this.contracts.ERC20TokenShop.address}
              </Typography>
              <Typography style={style02} >
                  Balance: {tknBalanceGroomed} TOBY
              </Typography>
              </Toolbar>
            </AppBar>
    )
  }
}

MyAppBar.contextTypes = {
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

export default drizzleConnect(MyAppBar, mapStateToProps)
