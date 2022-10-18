const DforceFacet = artifacts.require('DforceFacet')
const { DFORCE_COMPTROLLER_ADDRESS } = require('../constants/mainnet')

const migration = async function (deployer, network, accounts) {
  //Deployer address
  console.log(`Deploying from ${accounts[0]}`)
  await deployer.deploy(DforceFacet)
  
  const dforceFacet = await DforceFacet.deployed()
  console.log(`DforceFacet deployed to ${dforceFacet.address}`)

  const facetInstance = new web3.eth.Contract(dforceFacet.abi, dforceFacet.address)
  await facetInstance.methods
    .setDforceComptrollerAddr(DFORCE_COMPTROLLER_ADDRESS)
    .send({ from: accounts[0] })

  await facetInstance.methods
    .setDforceFee(300)
    .send({ from: accounts[0] })
}

module.exports = migration

// because of https://stackoverflow.com/questions/40900791/cannot-redeclare-block-scoped-variable-in-unrelated-files
export {}
