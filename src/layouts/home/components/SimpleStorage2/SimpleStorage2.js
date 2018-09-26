import React, { Component } from 'react'
import { ContractData } from 'drizzle-react-components'
import store from '../../../../store'
import PropTypes from 'prop-types'

class SimpleStorage2 extends Component {
  constructor(props, context) {
    super(props)

    this.store = store.getState()
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
    this.store.contracts.SimpleStorage02.set(this.state.storageAmount).send()
  }

  render() {
    //console.log(JSON.stringify(this.store.contracts.SimpleStorage02.storedData));
    //var storedData2 = this.props.drizzleStatus.initialized ? this.contracts.SimpleStorage2.methods.storedData.data() : 'Loading...'
    //var dstore = store.getState()
    //console.log(JSON.stringify(dstore, null, 4))
    //console.log(JSON.stringify(this.store, null, 4))
    var storedData = this.store.drizzleStatus.initialized ? this.store.contracts.SimpleStorage02 : 'Loading...'
    var data = []
    for (var i = 0; i < storedData.length; i++) {
      data.push(data[i])
    }
    //<p><strong>Stored Value</strong>: {data[2]} </p>
    //console.log(JSON.stringify(this.store.contracts.SimpleStorage02, null, 4))
    return (
      <div className="pure-u-1-1">
        <h2>This is the Storage 2 Component</h2>
        <p><strong>Stored Value</strong>: <ContractData contract="SimpleStorage02" method="storedData" /> </p>
        <form className="pure-form pure-form-stacked">
          <input name="storageAmount" type="number" value={this.state.storageAmount} onChange={this.handleInputChange} />
          <button className="pure-button" type="button" onClick={this.handleSetButton}>Store Value of {this.state.storageAmount2}</button>
        </form>

        <br/><br/>
      </div>

    )
  }
}

SimpleStorage2.contextTypes = {
  drizzle: PropTypes.object
}

export default SimpleStorage2
