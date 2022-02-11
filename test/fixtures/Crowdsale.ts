import { BigNumber } from 'ethers'
import { deployments } from 'hardhat'
import {
  AUCTION_TOKENS,
  CROWDSALE_GOAL,
  CROWDSALE_RATE,
  CROWDSALE_RATE_2,
  CROWDSALE_TIME,
  CROWDSALE_TOKENS,
  CROWDSALE_TOKENS_2,
  ETH_ADDRESS,
  ZERO_ADDRESS,
} from '../constants'
import { deployCrowdsale } from '../Crowdsale.test'
import { deployFixedToken } from '../functions'

export const CrowdsaleETH = deployments.createFixture(async ({ deployments, ethers }) => {
  await deployments.fixture(['CrowdsaleETH'], { keepExistingDeployments: true })
  const { owner, wallet } = await ethers.getNamedSigners()

  // StartTime needs to be at least a bit in the future
  const startTime = BigNumber.from((await ethers.provider.getBlock('latest')).timestamp + 1000)
  const endTime = startTime.add(CROWDSALE_TIME)

  const AuctionToken = await deployFixedToken('AuctionToken', 'AT', owner.address, CROWDSALE_TOKENS)
  const Crowdsale = await deployCrowdsale(
    owner.address,
    AuctionToken,
    ETH_ADDRESS,
    CROWDSALE_TOKENS,
    startTime,
    endTime,
    CROWDSALE_RATE,
    CROWDSALE_GOAL,
    owner.address,
    ZERO_ADDRESS,
    wallet.address
  )

  return { AuctionToken, Crowdsale }
}, 'CrowdsaleETH')

export const CrowdsaleERC20 = deployments.createFixture(async ({ deployments, ethers }) => {
  await deployments.fixture(['CrowdsaleERC20'], { keepExistingDeployments: true })
  const { owner, wallet } = await ethers.getNamedSigners()

  // StartTime needs to be at least a bit in the future
  const startTime = BigNumber.from((await ethers.provider.getBlock('latest')).timestamp + 1000)
  const endTime = startTime.add(CROWDSALE_TIME)

  const AuctionToken = await deployFixedToken('AuctionToken', 'AT', owner.address, CROWDSALE_TOKENS_2)
  const PaymentToken = await deployFixedToken('PaymentToken', 'PT', owner.address, AUCTION_TOKENS)
  const Crowdsale = await deployCrowdsale(
    owner.address,
    AuctionToken,
    PaymentToken.address,
    CROWDSALE_TOKENS_2,
    startTime,
    endTime,
    CROWDSALE_RATE_2,
    CROWDSALE_GOAL,
    owner.address,
    ZERO_ADDRESS,
    wallet.address
  )

  return { AuctionToken, PaymentToken, Crowdsale }
}, 'CrowdsaleERC20')
