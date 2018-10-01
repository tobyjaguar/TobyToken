import getWeb3 from './web3/getWeb3'

export function groomWei(weiValue) {
  var factor = Math.pow(10, 4)
  return getWeb3.then((err, web3Instance) => {
      return web3Instance.payload.web3Instance.utils.fromWei(weiValue)
  })
  .then(balance => {
    return (Math.round(balance * factor) / factor)
  })
}
