import { FACTORY_ADDRESS, WNATIVE_ADDRESS } from '@sushiswap/core-sdk'

import { NomicLabsHardhatPluginError } from 'hardhat/plugins'
import { task } from 'hardhat/config'

task('verify-all', 'Verify all contracts', async (_, { ethers, tenderly, run, getChainId }) => {
  const chainId = Number(await getChainId())

  const batchAuction = await ethers.getContract('BatchAuction')
  const crowdsale = await ethers.getContract('Crowdsale')
  const dutchAuction = await ethers.getContract('DutchAuction')
  const fixedToken = await ethers.getContract('FixedToken')
  const hyperbolicAuction = await ethers.getContract('HyperbolicAuction')
  const listFactory = await ethers.getContract('ListFactory')
  const mintableToken = await ethers.getContract('MintableToken')
  const accessControls = await ethers.getContract('MISOAccessControls')
  const farmFactory = await ethers.getContract('MISOFarmFactory')
  const helper = await ethers.getContract('MISOHelper')
  const launcher = await ethers.getContract('MISOLauncher')
  const market = await ethers.getContract('MISOMarket')
  const masterChef = await ethers.getContract('MISOMasterChef')
  const tokenFactory = await ethers.getContract('MISOTokenFactory')
  const pointList = await ethers.getContract('PointList')
  const postAuctionLauncher = await ethers.getContract('PostAuctionLauncher')
  const sushiToken = await ethers.getContract('SushiToken')
  const auctionCreation = await ethers.getContract('AuctionCreation')
  const contracts: {
    name: string
    address: string
    constructorArguments?: string[]
  }[] = [
    {
      name: 'BatchAuction',
      address: batchAuction.address,
    },
    {
      name: 'Crowdsale',
      address: crowdsale.address,
    },
    {
      name: 'DutchAuction',
      address: dutchAuction.address,
    },
    {
      name: 'FixedToken',
      address: fixedToken.address,
    },
    {
      name: 'HyperbolicAuction',
      address: hyperbolicAuction.address,
    },
    {
      name: 'ListFactory',
      address: listFactory.address,
    },
    {
      name: 'MintableToken',
      address: mintableToken.address,
    },
    {
      name: 'MISOAccessControls',
      address: accessControls.address,
    },
    {
      name: 'MISOFarmFactory',
      address: farmFactory.address,
    },
    {
      name: 'MISOHelper',
      address: helper.address,
      constructorArguments: [
        accessControls.address,
        tokenFactory.address,
        market.address,
        launcher.address,
        farmFactory.address,
      ],
    },
    {
      name: 'MISOLauncher',
      address: launcher.address,
    },
    {
      name: 'MISOMarket',
      address: market.address,
    },
    {
      name: 'MISOMasterChef',
      address: masterChef.address,
    },
    {
      name: 'MISOTokenFactory',
      address: tokenFactory.address,
    },
    {
      name: 'PointList',
      address: pointList.address,
    },
    {
      name: 'PostAuctionLauncher',
      address: postAuctionLauncher.address,
      constructorArguments: [WNATIVE_ADDRESS[chainId]],
    },
    {
      name: 'SushiToken',
      address: sushiToken.address,
    },
    {
      name: 'AuctionCreation',
      address: auctionCreation.address,
      constructorArguments: [
        tokenFactory.address,
        listFactory.address,
        launcher.address,
        market.address,
        FACTORY_ADDRESS[chainId],
      ],
    },
  ]
  for (const { address, constructorArguments } of contracts) {
    try {
      await run('verify:verify', {
        address,
        constructorArguments,
      })
    } catch (error) {
      if (error instanceof NomicLabsHardhatPluginError) {
        console.debug(error.message)
      }
    }
  }
  await tenderly.verify(contracts)
})
