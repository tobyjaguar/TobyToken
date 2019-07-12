import React, { Component } from 'react'
import logo from '../../assets/Shop.jpg'
import PropTypes from 'prop-types'

/* components */
import Account from './components/Account'
import ShopItem from './components/ShopItem'
import BurnToken from './components/BurnToken'
import TransferToken from './components/TransferToken'
import Admin from './components/Admin'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import TXModal from './components/TXModal'
import Button from '@material-ui/core/Button'

//inline styles
const styles = {
  backgroundColor: '#F9DBDB',
  color: 'black',
  fontFamily: "'Open Sans', sans-serif",
  fontSize: "14pt",
  padding: 30
}

class Home extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts

    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleAccountButton = this.handleAccountButton.bind(this)
    this.handleShopButton = this.handleShopButton.bind(this)
    this.handleTransferButton = this.handleTransferButton.bind(this)
    this.handleBurnButton = this.handleBurnButton.bind(this)
    this.handleAdminButton = this.handleAdminButton.bind(this)

    this.state = {
        showAdmin: false,
        showShop: false,
        showBurn: false,
        showTransfer: false,
        showAccount: false,
        dataKeyOwner: null,
        dataKeyTknBalance: null,
        shopKeeper: '',
        tokenBalance: ''
    }
  }

  componentDidMount() {
    const dataKeyOwner = this.contracts.ERC20TokenShop.methods["owner"].cacheCall()
    const dataKeyTknBalance = this.contracts.ERC20TokenShop.methods["getTokenBalance"].cacheCall(this.props.accounts[0])
    this.setState({dataKeyOwner, dataKeyTknBalance})
    this.setShopKeeper()
    this.setTokenBalance()
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.TokenShop !== prevProps.TokenShop) {
      this.setShopKeeper()
      this.setTokenBalance()
    }
  }

  handleInputChange(event) {
    this.setState({ [event.target.name]: event.target.value })
  }

  setShopKeeper() {
    if (this.props.TokenShop.owner[this.state.dataKeyOwner] !== undefined && this.state.dataKeyOwner !== null) {
      this.setState({
        shopKeeper: this.props.TokenShop.owner[this.state.dataKeyOwner].value
      })
    }
  }

  setTokenBalance() {
    if (this.props.TokenShop.getTokenBalance[this.state.dataKeyTknBalance] !== undefined && this.state.dataKeyTknBalance !== null) {
      this.setState({
        tokenBalance: this.props.TokenShop.getTokenBalance[this.state.dataKeyTknBalance].value
      })
    }
  }

  handleAccountButton() {
      this.setState({
        showAccount: !this.state.showAccount
      })
  }

  handleShopButton() {
    this.setState({
      showShop: !this.state.showShop
    })
  }

  handleBurnButton() {
    this.setState({
      showBurn: !this.state.showBurn
    })
  }

  handleTransferButton() {
    this.setState({
      showTransfer: !this.state.showTransfer
    })
  }

  handleAdminButton() {
    var owner
    owner = this.props.accounts[0]
    if (this.state.shopKeeper === owner) {
      this.setState({
        showAdmin: !this.state.showAdmin
      })
    }
  }

  groomWei(weiValue) {
    var factor = Math.pow(10, 4)
    var balance = this.context.drizzle.web3.utils.fromWei(weiValue)
    balance = Math.round(balance * factor) / factor
    return balance
  }

  render() {
    var tknBalanceGroomed = this.groomWei(this.state.tokenBalance)

    var displayAccount
    var displayAdmin
    var displayShop
    var displayBurn
    var displayTransfer

    if (this.state.showAccount) {
      displayAccount = <Account tknBalance={tknBalanceGroomed} />
    }

    if (this.state.showShop) {
      displayShop = <ShopItem />
    }

    if (this.state.showBurn) {
      displayBurn = <BurnToken tknBalance={this.state.tokenBalance} />
    }

    if (this.state.showTransfer) {
      displayTransfer = <TransferToken tknBalance={this.state.tokenBalance} />
    }

    if (this.state.showAdmin) {
      displayAdmin = <Admin />
    }

    return (
      <main className="container">


          <div className="pure-u-1-1 header">
            <img src={logo} alt="toby-token-shop" width={500} />
          </div>

            <Paper>
              <Typography style={styles}>
              This is a token shop where you can purchase TOBY tokens for Ether.
              Each TOBY token costs $1, and is purchased in Ether. The goal is to
              buy TOBY tokens here and then sell them back to Toby in person.
              TOBY is an ERC20 token. Please have MetaMask enabled.
              </Typography>
            </Paper>

          <TXModal />

            <br/>
            <Button type="Button" variant="contained" onClick={this.handleShopButton}> Buy Token </Button>
            <br/>
            <br/>
            {displayShop}

            <br/>
            <Button type="Button" variant="contained" onClick={this.handleBurnButton}> Burn Token </Button>
            <br/>
            <br/>
            {displayBurn}

            <br/>
            <Button type="Button" variant="contained" onClick={this.handleTransferButton}> Transfer Token </Button>
            <br/>
            <br/>
            {displayTransfer}

            <br/>
            <Button type="Button" variant="contained" onClick={this.handleAccountButton}> Account Info </Button>
            <br/>
            <br/>
            {displayAccount}

            <br/>
            {this.state.shopKeeper === this.props.accounts[0] ?
              <Button type="Button" variant="contained" onClick={this.handleAdminButton}> Admin </Button> : 
              null
            }
            <br/>
            <br/>
            {displayAdmin}
            <br/>

            <br/><br/>

            <a href="https://www.freepik.com/free-photos-vectors/flower"><font color="#F9DBDB">Flower vector created by Rawpixel.com - Freepik.com</font></a>
      </main>
    )
  }
}

Home.contextTypes = {
  drizzle: PropTypes.object
}

export default Home
