import React, { Component } from 'react'
import { AccountData, ContractData, ContractForm } from 'drizzle-react-components'
import logo from '../../logo.png'

class Home extends Component {
  render() {
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

            <br/><br/>
          </div>
          {/*
          <div className="pure-u-1-1">
            <h2>SimpleStorage</h2>
            <p>This shows a simple ContractData component with no arguments, along with a form to set its value.</p>
            <p><strong>Stored Value</strong>: <ContractData contract="SimpleStorage" method="storedData" /></p>
            <ContractForm contract="SimpleStorage" method="set" />

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

            {/*
              <p><ContractForm contract="ERC20TobyToken" method="balanceOf" labels={['Address']} /></p>
              */}

            <br/><br/>
          </div>

          <div className="pure-u-1-1">
            <h2>Token Shop</h2>
            <p>Buy Tokens.</p>

            <p><strong>Name: </strong> <ContractData contract="ERC20TokenStore" method="getTokenName" /></p>

            <p><strong>Symbol: </strong> <ContractData contract="ERC20TokenStore" method="getTokenSymbol" /></p>
            <p><strong>Total Supply:</strong> <ContractData contract="ERC20TokenStore" method="getTokenSupply" methodArgs={[{from: this.props.accounts[0]}]} /></p>
            <p><strong>My Balance</strong>: <ContractData contract="ERC20TokenStore" method="getTokenBalance" methodArgs={[this.props.accounts[0]]} /></p>
            {/*
            <h3>Mint Tokens</h3>
            <ContractForm contract="ERC20TobyToken" method="mint" labels={['Recipient', 'Amount to Mint']} />

            <h3>Burn Tokens</h3>
            <p>Burn your tokens.</p>
            <ContractForm contract="ERC20TobyToken" method="burn" labels={['Amount to Burn']} />

              */}

            <br/><br/>
          </div>


        </div>
      </main>
    )
  }
}

export default Home
