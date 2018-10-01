import React, { Component } from 'react'
import { AccountData } from 'drizzle-react-components'
//import logo from '../../logo.png'
import PropTypes from 'prop-types'

/* components */
import ShopItem from './components/ShopItem'
import Admin from './components/Admin'
import TXModal from './components/TXModal'
import Button from '@material-ui/core/Button'

class Home extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts

    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleLogInButton = this.handleLogInButton.bind(this)

    this.state = {
        loggedIn: false,
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

  handleLogInButton() {
    var owner
    owner = this.props.accounts[0]
    if (this.state.shopKeeper === owner) {
      this.setState({loggedIn: true})
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

    var displayAdmin
    if (this.state.loggedIn) {
      displayAdmin = <Admin />
    }

    return (
      <main className="container">
        <div className="pure-g">

          {/*
          <div className="pure-u-1-1 header">
            <img src={logo} alt="drizzle-logo" />
            <h1>Drizzle Example</h1>

            <br/><br/>
          </div>
          */}

          <div className="pure-u-1-1">
            <h2>Active Account</h2>
            <AccountData accountIndex="0" units="ether" precision="3" />
            <p><strong>Token Balance: </strong> {tknBalanceGroomed} TOBY</p>

            {/*
            <AccountData accountIndex="1" units="ether" precision="3" />
            <AccountData accountIndex="2" units="ether" precision="3" />
            */}
            <br/><br/>
          </div>

            <TXModal />
          <div className="pure-u-1-1">
            <h2>TokenShop</h2>
            <p>Shop Address: {this.contracts.ERC20TokenShop.address} </p>
            <ShopItem />

            <br/><br/>
          </div>

          <div className="pure-u-1-1">
            {displayAdmin}
            <br/>
            <Button type="Button" variant="contained" onClick={this.handleLogInButton}> Admin </Button>
            <br/><br/>
          </div>

        </div>
      </main>
    )
  }
}

Home.contextTypes = {
  drizzle: PropTypes.object
}

export default Home
