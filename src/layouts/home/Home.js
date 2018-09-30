import React, { Component } from 'react'
import { AccountData, ContractData } from 'drizzle-react-components'
//import logo from '../../logo.png'
import PropTypes from 'prop-types'

/* components */
import ShopItem from './components/ShopItem'
import Admin from './components/Admin'
import TXModal from './components/TXModal'
//import TXObject from './components/TXObject'
//import LogIn from './components/LogIn'

class Home extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts

    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleLogInButton = this.handleLogInButton.bind(this)

    this.state = {
        loggedIn: false,
        dataKeyOwner: null,
        shopKeeper: '',
    }
  }

  componentDidMount() {
    const dataKeyOwner = this.contracts.ERC20TokenShop.methods["owner"].cacheCall()
    this.setState({dataKeyOwner})
    this.setShopKeeper(this.props.TokenShop)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.TokenShop !== prevProps.TokenShop) {
      this.setShopKeeper(this.props.TokenShop)
    }
  }

  handleInputChange(event) {
    this.setState({ [event.target.name]: event.target.value })
  }

  setShopKeeper(contract) {
    if (contract.owner[this.state.dataKeyOwner] !== undefined && this.state.dataKeyOwner !== null) {
      this.setState({
        shopKeeper: contract.owner[this.state.dataKeyOwner].value
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

  render() {
    var displayAdmin
    if (this.state.loggedIn) {
      displayAdmin = <Admin />
    }
    //console.log(JSON.stringify(this.props, null, 4))
    //const tokenContract = this.context.drizzle.store.getState().contracts.ERC20TobyToken
    //console.log(this.props.transactions[stackId])
    //console.log(this.state.loggedIn)
    //console.log(this.state.shopKeeper)
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
            <p><strong>Token Balance: </strong><ContractData contract="ERC20TokenShop" method="getTokenBalance" methodArgs={[this.props.accounts[0]]} /></p>

            {/*
            <AccountData accountIndex="1" units="ether" precision="3" />
            <AccountData accountIndex="2" units="ether" precision="3" />
            */}
            <br/><br/>
          </div>

          {/*
          <div className="pure-u-1-1">
            <h2>SimpleStorage</h2>
            <p>This shows a simple ContractData component with no arguments, along with a form to set its value.</p>
            <p><strong>Stored Value</strong>: </p>
            <form className="pure-form pure-form-stacked">
              <input name="storageAmount" type="number" value={this.state.storageAmount} onChange={this.handleInputChange} />
              <button className="pure-button" type="button" onClick={this.handleSetButton}>Store Value of {this.state.storageAmount}</button>
            </form>

            <br/><br/>
          </div>
          */}

          {/*tx Return Object*/}
            {/*{txResult}*/}
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
            <form className="pure-form pure-form-stacked">
              <button className="pure-button" type="button" onClick={this.handleLogInButton}> Login </button>
            </form>
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
