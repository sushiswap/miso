import { task } from 'hardhat/config'

import { FixedToken, MintableToken, MISOTokenFactory, SushiToken } from '../typechain'

task('add-all-tokens', 'Adds token').setAction(async function (_, { ethers: { getNamedSigner, getContract } }) {
  const admin = await getNamedSigner('admin')
  const misoTokenFactory = await getContract<MISOTokenFactory>('MISOTokenFactory', admin)
  const fixedToken = await getContract<FixedToken>('FixedToken', admin)
  const mintableToken = await getContract<MintableToken>('MintableToken', admin)
  const sushiToken = await getContract<SushiToken>('SushiToken', admin)
  console.log('Adding tokens...')

  for (const address of [fixedToken.address, mintableToken.address, sushiToken.address]) {
    try {
      await misoTokenFactory.addTokenTemplate(address).then((tx) => tx.wait(3))
    } catch (error) {
      console.error('Error adding token: ' + address, error)
    }
  }
  console.log('Tokens added!')
})
