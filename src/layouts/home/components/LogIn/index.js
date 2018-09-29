import React, { Component } from 'react'
import { connect } from 'react-redux'


class LogIn extends Component {
  constructor(props, context) {
    super(props)

    this.handleLogInButton = this.handleLogInButton.bind(this)

  }

  handleLogInButton() {
    var owner
    owner = this.props.accounts[0]
    if (this.props.shopKeeper === owner) {
      this.setState({loggedIn: true})
    }
  }

  render() {

    return (
      <div>
        <form className="pure-form pure-form-stacked">
          <button className="pure-button" type="button" onClick={this.handleLogInButton}> Login </button>
        </form>
      </div>
    )

  }
}

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    onLoginUserClick: (event) => {
      event.preventDefault();

      dispatch(loginUser())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LogIn)
