# Toby's Token Shop
![](https://github.com/tobyjaguar/TobyToken/blob/master/src/assets/Shop.jpg)
## a token shop app
This is a living project and available to explore at [TobyToken.Shop](https://www.tobytoken.shop). If you would like to engage with the app, you will need to have [MetaMask](https://metamask.io/) installed.
The TokenShop will work on Mainnet and Ropsten. 

The goal of the project is to detail the lifecycle of a token economy, while documenting the steps involved in deploying a somewhat destributed app on the ethereum blockchain. This repo and corresponding app is a work-in-progress. It will continue to be updated, and serve as a social art project.

## Purpose
The purpose of this project is principally for education, yours and mine ;) The intention is for a user to purchase tokens in Ether relavtive to dollar terms. When a user purchases a token the Dollar per Ether cross rate that is updated via [Oraclize](http://www.oraclize.it/). After a user has TOBY tokens, Toby, the IRL person will buy the tokens back in dollars (IRL USD). The token shop will never have more than 100 TOBY tokens in stock.

## The Anatomy
The app is built using the [Drizzle](https://www.truffleframework.com/docs/drizzle/overview) box from the TruffleSuite. Drizzle is a "collection of front end libraries" which allow for easy integration with React, Redux, and Web3 functionality in communicating with ethereum smart contracts. The app uses React components and takes advantage of the Drizzle Redux store. The app communicates with the TokenShop contract, which in turn communicates with the TobyToken contract. The TobyToken contract uses the [OpenZeppelin](https://openzeppelin.org/) contract libraries for ERC20 tokens. The TOBY token is an ERC20 token using the openzeppelin version 2.0 ERC20 token contracts. **WARNING**: These contract implementations have not been released yet, and are not advised to use.

The TokenShop contract uses Oraclize to get the Dollar to Ether conversion rate each time a user purchases tokens. Unfortunately, this Oracle call is expensive, and as business goes, this expense is passed on to the customer. The Oracle call is wrapped into the transaction that the user executes to buy tokens, so this tax is applied to the amount the user spends on purchasing tokens. What this means is that if a user buys 1 dollar worth of TOBY tokens (equivalent to 1 TOBY), the user will end up paying more than 1 dollar worth of Ether, due to the cost of the Oracle and trasaction fees that go to the network.

## Building
This is a bit tricky to build. This section will continue to improve as the project evolves. As of now, to clone and build takes some effort. If one is so inclined, the instructions that follow are how the app was built for the web server.

Clone the repository:

`git clone https://github.com/tobyjaguar/TobyToken.git`
   
Install the submodules:

`git submodule init`

`git submodule update --remote openzeppelin-solidity`

`git submodile update --remote ethereum-api`

*note: if git is blocked on your environment run:* 
`git config --global url."https://".insteadOf git://`

Install the npm dependencies:

`npm install`

*note: depending on your environment sudo may need to be invoked*

If some node modules do not download, the build will complain and they can be downloaded manually. If npm has permission to write and git can connect then all modules should download correctly. 
 
The app uses [dotenv](https://www.npmjs.com/package/dotenv) to pull in the HD Wallet Mnemonic for the wallet accounts and the [Infura](https://infura.io/) Access Token. If deployment is an interest a .env file will need to be created.

For development testing, MetaMask will serve as the Web3 provider.

## Lessons

There are a lot of them, and they will be written here soon.