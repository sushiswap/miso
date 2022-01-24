import { BigNumber } from '@ethersproject/bignumber'
import { e10 } from './functions'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

export const AUCTION_TOKENS = BigNumber.from(10000).mul(e10(18))
export const AUCTION_TIME = BigNumber.from(50000)
export const AUCTION_START_PRICE = BigNumber.from(100).mul(e10(18))
export const AUCTION_RESERVE = e10(15)
export const AUCTION_MINIMUM_COMMITMENT = BigNumber.from(10).mul(e10(18))

export const CROWDSALE_TOKENS = BigNumber.from(10000).mul(e10(18))
export const CROWDSALE_TOKENS_2 = BigNumber.from(10).mul(e10(18))

export const CROWDSALE_TIME = BigNumber.from(50000)
export const CROWDSALE_RATE = e10(15)
export const CROWDSALE_RATE_2 = e10(18)

export const CROWDSALE_GOAL = BigNumber.from(10).mul(e10(18))
export const CROWDSALE_GOAL_2 = BigNumber.from(5).mul(e10(18))

export const CROWDSALE_RATE_USDC = BigNumber.from(50)
export const CROWDSALE_RATE_USDC_2 = BigNumber.from(2).mul(e10(6))

export const CROWDSALE_GOAL_USDC = BigNumber.from(10).mul(e10(6))
export const CROWDSALE_GOAL_USDC_2 = BigNumber.from(5).mul(e10(6))

export const SECONDS_IN_DAY = BigNumber.from(24 * 60 * 60)

export const TOKENS_TO_MINT = BigNumber.from(1000).mul(e10(18))
export const ETH_TO_DEPOSIT = e10(18)

export const POOL_LAUNCH_DEADLINE = BigNumber.from(10).mul(SECONDS_IN_DAY)
export const POOL_LAUNCH_WINDOW = BigNumber.from(3).mul(SECONDS_IN_DAY)
export const POOL_LAUNCH_LOCKTIME = BigNumber.from(30).mul(SECONDS_IN_DAY)
export const POOL_LIQUIDITY_PERCENT = BigNumber.from(100)
export const HYPERBOLIC_AUCTION_FACTOR = BigNumber.from(2)

export const DOCUMENT_NAME = 'MISO'
export const DOCUMENT_DATA = 'MISO: Do you comply?'

export const USDC_TOKENS = BigNumber.from(1000000).mul(e10(18))
