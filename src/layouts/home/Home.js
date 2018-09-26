import React, { Component } from 'react'
import { AccountData, ContractData, ContractForm } from 'drizzle-react-components'
import logo from '../../logo.png'
import PropTypes from 'prop-types'

/* components */
import ShopItem from './components/ShopItem'
import Admin from './components/Admin'


class Home extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts

    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleSetButton = this.handleSetButton.bind(this)

    this.state = {
      storageAmount: 0
    }
  }

  handleInputChange(event) {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleSetButton() {
    this.contracts.SimpleStorage02.methods.set(this.state.storageAmount).send()
  }

  render() {

    //console.log(JSON.stringify(this.props, null, 4))

    return (
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1 header">
            <img src={logo} alt="drizzle-logo" />
            <h1>Drizzle Examples</h1>
            <p>Examples of how to get started with Drizzle in various situations.</p>

            <br/><br/>
          </div>

          <div className="pure-u-1-1">
            <h2>Active Account</h2>
            <AccountData accountIndex="0" units="ether" precision="3" />
            <AccountData accountIndex="1" units="ether" precision="3" />
            <AccountData accountIndex="2" units="ether" precision="3" />
            <p><strong>Token Balance: </strong> <ContractData contract="ERC20TokenStore" method="getTokenBalance" methodArgs={[this.props.accounts[0]]} /></p>
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
          {/*
          <div className="pure-u-1-1">
            <h2>TutorialToken</h2>
            <p>Here we have a form with custom, friendly labels. Also note the token symbol will not display a loading indicator. We've suppressed it with the <code>hideIndicator</code> prop because we know this variable is constant.</p>
            <p><strong>Total Supply</strong>: <ContractData contract="TutorialToken" method="totalSupply" methodArgs={[{from: this.props.accounts[0]}]} /> <ContractData contract="TutorialToken" method="symbol" hideIndicator /></p>
            <p><strong>My Balance</strong>: <ContractData contract="TutorialToken" method="balanceOf" methodArgs={[this.props.accounts[0]]} /></p>
            <h3>Send Tokens</h3>
            <ContractForm contract="TutorialToken" method="transfer" labels={['To Address', 'Amount to Send']} />

            <br/><br/>
          </div>
          */}
          {/*
          <div className="pure-u-1-1">
            <h2>ComplexStorage</h2>
            <p>Finally this contract shows data types with additional considerations. Note in the code the strings below are converted from bytes to UTF-8 strings and the device data struct is iterated as a list.</p>
            <p><strong>String 1</strong>: <ContractData contract="ComplexStorage" method="string1" toUtf8 /></p>
            <p><strong>String 2</strong>: <ContractData contract="ComplexStorage" method="string2" toUtf8 /></p>
            <strong>Single Device Data</strong>: <ContractData contract="ComplexStorage" method="singleDD" />

            <br/><br/>
          </div>
          */}
          {/*
          <div className="pure-u-1-1">
            <h2>TobyToken</h2>
            <p>This is the Token Contract.</p>

            <p><strong>Name: </strong> <ContractData contract="ERC20TobyToken" method="name" /></p>

            <p><strong>Symbol: </strong> <ContractData contract="ERC20TobyToken" method="symbol" /></p>
            <p><strong>Total Supply:</strong> <ContractData contract="ERC20TobyToken" method="totalSupply" methodArgs={[{from: this.props.accounts[0]}]} /></p>
            <p><strong>My Balance</strong>: <ContractData contract="ERC20TobyToken" method="balanceOf" methodArgs={[this.props.accounts[0]]} /></p>

            <h3>Mint Tokens</h3>
            <ContractForm contract="ERC20TobyToken" method="mint" labels={['Recipient', 'Amount to Mint']} />

            <h3>Burn Tokens</h3>
            <p>Burn your tokens.</p>
            <ContractForm contract="ERC20TobyToken" method="burn" labels={['Amount to Burn']} />

              //comment out
              <p><ContractForm contract="ERC20TobyToken" method="balanceOf" labels={['Address']} /></p>


            <br/><br/>
          </div>
          */}

          <div className="pure-u-1-1">
            <h2>TokenShop</h2>
            <p>Shop Address: {this.contracts.ERC20TokenStore.address} </p>
            <ShopItem />

            <br/><br/>
          </div>


          <div className="pure-u-1-1">
            <h2>Admin</h2>
            <p>Shop Address: {this.contracts.ERC20TokenStore.address} </p>
            <p>Token Address: {this.contracts.ERC20TobyToken.address} </p>
            <Admin />

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
