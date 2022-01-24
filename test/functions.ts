import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import hre, { ethers } from 'hardhat'
import { FixedToken as IFixedToken } from '../typechain'

type Contract = typeof ethers.Contract.prototype

export async function setStartTime(auction: Contract) {
  const currentTime = (await hre.ethers.provider.getBlock('latest')).timestamp
  const startTime = (await auction.marketInfo()).startTime.toNumber()

  if (currentTime < startTime) {
    await hre.network.provider.request({ method: 'evm_setNextBlockTimestamp', params: [startTime] })
    await hre.network.provider.request({ method: 'evm_mine' })
  }
}

export async function setEndTime(auction: Contract) {
  const currentTime = (await hre.ethers.provider.getBlock('latest')).timestamp
  const endTime = (await auction.marketInfo()).endTime.toNumber()

  if (currentTime < endTime) {
    await hre.network.provider.request({ method: 'evm_setNextBlockTimestamp', params: [endTime] })
    await hre.network.provider.request({ method: 'evm_mine' })
  }
}

export async function deployFixedToken(name: string, symbol: string, owner: string, amount: BigNumberish) {
  const token = (await (await ethers.getContractFactory('FixedToken')).deploy()) as IFixedToken
  await token.functions['initToken(string,string,address,uint256)'](name, symbol, owner, amount)

  return token
}

export function e10(e: BigNumberish) {
  return BigNumber.from(10).pow(e)
}
