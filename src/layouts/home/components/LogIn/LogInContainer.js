import { connect } from 'react-redux'
import LogIn from './Index'
import { loginUser } from './LogInActions'

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

const LogInContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LogIn)

export default LogInContainer
