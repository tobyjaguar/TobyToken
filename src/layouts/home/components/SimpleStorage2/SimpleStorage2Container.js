import SimpleStorage2 from './SimpleStorage2'
import { drizzleConnect } from 'drizzle-react'

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    SimpleStorage: state.contracts.SimpleStorage,
    SimpleStorage2: state.contracts.SimpleStorage2,
    TutorialToken: state.contracts.TutorialToken,
    TobyToken: state.contracts.TobyToken,
    TokenShop: state.contracts.TokenStore,
    drizzleStatus: state.drizzleStatus
  }
}

const SimpleStorage2Container = drizzleConnect(SimpleStorage2, mapStateToProps);

export default SimpleStorage2Container
