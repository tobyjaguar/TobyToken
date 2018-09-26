import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

class ContractAddress extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts
    //this.dataKey = this.contracts.SimpleStorage.methods.storedData.cacheCall()
    //this.dataKey = this.contracts.ERC20TobyToken.methods.name.cacheCall()
    this.dataKey = this.contracts.ERC20TokenStore.methods.getStoreStock.cacheCall()
    console.log(JSON.stringify(this.dataKey, null, 4));
    this.state = {
      shopAddress: 'hello'
    }

  }

  render() {
    //var storedData = this.contracts.SimpleStorage.methods.storedData.data()
    //var storedData = this.props.drizzleStatus.initialized ? this.context.drizzle.contracts.SimpleStorage.methods.storedData.data() : 'Loading...'
    //Shop
    //var contractAddress = this.props.drizzleStatus.initialized ? this.contracts.TokenShop.methods.storeStock.data() : 'Loading...'
    //var data = this.props.SimpleStorage.storedData[this.dataKey].value
    //console.log(JSON.stringify(this.props.contracts.SimpleStorage.storedData[this.dataKey].value, null, 4));
    console.log(JSON.stringify(this.contracts.ERC20TokenStore.methods.getStoreStock.data()));
    return(
      <div>{}</div>
    )
  }
}

ContractAddress.contextTypes = {
  drizzle: PropTypes.object
}

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    SimpleStorage: state.contracts.SimpleStorage,
    TutorialToken: state.contracts.TutorialToken,
    TobyToken: state.contracts.TobyToken,
    TokenShop: state.contracts.TokenStore,
    drizzleStatus: state.drizzleStatus
  }
}

const AddressContainer = drizzleConnect(ContractAddress, mapStateToProps);

export default ContractAddress
