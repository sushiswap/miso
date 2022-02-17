import { expect } from 'chai'
import hre, { ethers } from 'hardhat'
import {
  _1e18,
  AUCTION_TOKENS,
  CROWDSALE_GOAL,
  CROWDSALE_RATE,
  CROWDSALE_TIME,
  CROWDSALE_TOKENS,
  DOCUMENT_DATA,
  DOCUMENT_NAME,
  ETH_ADDRESS,
  ZERO_ADDRESS,
} from './constants'
import { FixedToken as IFixedToken, Crowdsale as ICrowdsale } from '../typechain'
import { setEndTime, setStartTime, deployFixedToken } from './functions'
import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { BigNumber, BigNumberish } from 'ethers'
import { Signers } from '../hardhat.config'
import { CrowdsaleERC20, CrowdsaleETH } from './fixtures/Crowdsale'

declare module 'mocha' {
  export interface Context {
    Crowdsale: ICrowdsale
    PaymentToken: IFixedToken
    AuctionToken: IFixedToken
    signers: Signers
  }
}

describe('Crowdsale', async function () {
  this.slow(1000)

  before('', async function () {
    this.signers = (await ethers.getNamedSigners()) as Signers
  })

  it('Init emits the correct events', async function () {
    const auctionToken = await deployFixedToken('AuctionToken', 'AT', this.signers.owner.address, CROWDSALE_TOKENS)
    const paymentToken = await deployFixedToken('PaymentToken', 'PT', this.signers.owner.address, AUCTION_TOKENS)

    // StartTime needs to be at least a bit in the future
    const startTime = BigNumber.from((await hre.ethers.provider.getBlock('latest')).timestamp + 10)
    const endTime = startTime.add(CROWDSALE_TIME)

    const crowdsale = (await (await ethers.getContractFactory('Crowdsale')).deploy()) as ICrowdsale
    await auctionToken.approve(crowdsale.address, CROWDSALE_TOKENS)

    // Can't make use of the deployCrowdsale function because we need to catch the events
    expect(
      await crowdsale.functions.initCrowdsale(
        this.signers.owner.address,
        auctionToken.address,
        paymentToken.address,
        CROWDSALE_TOKENS,
        startTime,
        endTime,
        CROWDSALE_RATE,
        CROWDSALE_GOAL,
        this.signers.owner.address,
        ZERO_ADDRESS,
        this.signers.wallet.address
      )
    )
      .to.emit(crowdsale, 'AuctionPointListUpdated')
      .withArgs(ZERO_ADDRESS, false)
      .and.to.emit(crowdsale, 'AuctionDeployed')
      .withArgs(
        this.signers.owner.address,
        auctionToken.address,
        paymentToken.address,
        CROWDSALE_TOKENS,
        this.signers.owner.address,
        this.signers.wallet.address
      )
      .and.to.emit(crowdsale, 'AuctionTimeUpdated')
      .withArgs(startTime, endTime)
      .and.to.emit(crowdsale, 'AuctionPriceUpdated')
      .withArgs(CROWDSALE_RATE, CROWDSALE_GOAL)
  })

  describe('payment currency ETH', async function () {
    beforeEach('', async function () {
      const { AuctionToken, Crowdsale } = await CrowdsaleETH()
      this.AuctionToken = AuctionToken
      this.Crowdsale = Crowdsale
    })

    describe('buy tokens', async function () {
      it('buy fails before start time', async function () {
        await expect(this.Crowdsale.commitEth(ZERO_ADDRESS, true, { value: 1 })).to.be.revertedWith(
          'Crowdsale: outside auction hours'
        )
      })

      it('buy tokens with erc20', async function () {
        const token = await deployFixedToken('PaymentToken', 'PT', this.signers.owner.address, 1)
        await token.approve(this.Crowdsale.address, 1)
        await expect(this.Crowdsale.commitTokens(1, true)).to.be.revertedWith(
          'Crowdsale: Payment currency is not a token'
        )
      })

      it('buy beneficiary is the zero address', async function () {
        await setStartTime(this.Crowdsale)
        await expect(this.Crowdsale.commitEth(ZERO_ADDRESS, true, { value: 1 })).to.be.revertedWith(
          'Crowdsale: beneficiary is the zero address'
        )
      })

      it('buy token multiple times goal not reached', async function () {
        await setStartTime(this.Crowdsale)
        let totalAmountRaised = BigNumber.from(0)
        const ethToTransfer = BigNumber.from(2).mul(_1e18)
        await buyTokensEth(this.Crowdsale, this.signers.beneficiary1, ethToTransfer)
        totalAmountRaised = totalAmountRaised.add(ethToTransfer)
        expect((await this.Crowdsale.marketStatus()).commitmentsTotal).to.equal(totalAmountRaised)

        await buyTokensEth(this.Crowdsale, this.signers.beneficiary1, ethToTransfer)
        totalAmountRaised = totalAmountRaised.add(ethToTransfer)
        expect((await this.Crowdsale.marketStatus()).commitmentsTotal).to.equal(totalAmountRaised)
      })

      it('buy fails after end time', async function () {
        await setStartTime(this.Crowdsale)
        await buyTokensEth(this.Crowdsale, this.signers.beneficiary1, BigInt(1))
        await setEndTime(this.Crowdsale)
        await expect(
          this.Crowdsale.commitEth(this.signers.beneficiary1.address, true, { value: 1 })
        ).to.be.revertedWith('Crowdsale: outside auction hours')
      })

      it('buy tokens greater than total tokens', async function () {
        await setStartTime(this.Crowdsale)

        const balanceBefore = await this.signers.beneficiary1.getBalance()
        const rate = (await this.Crowdsale.marketPrice()).rate
        const totalTokens = (await this.Crowdsale.marketInfo()).totalTokens
        const maxCommitment = totalTokens.mul(rate).div(_1e18)
        // Buy with twice the max amount
        await buyTokensEth(this.Crowdsale, this.signers.beneficiary1, maxCommitment.mul(2).toBigInt())
        const balanceAfter = await this.signers.beneficiary1.getBalance()
        // Expect the rest to be refunded
        expect(balanceBefore.sub(balanceAfter)).to.equal(maxCommitment)
      })
    })

    describe('withdraw tokens', async function () {
      it('withdraw tokens goal reached', async function () {
        await setStartTime(this.Crowdsale)
        const commitment = BigNumber.from(CROWDSALE_GOAL).div(2)
        await buyTokensEth(this.Crowdsale, this.signers.beneficiary1, commitment.toBigInt())
        await buyTokensEth(this.Crowdsale, this.signers.beneficiary2, commitment.toBigInt())
        await this.Crowdsale.finalize()
        const expectedTokenAmount = commitment.mul(_1e18).div((await this.Crowdsale.marketPrice()).rate)

        const beneficiary1balanceBefore = await this.AuctionToken.balanceOf(this.signers.beneficiary1.address)
        const beneficiary2balanceBefore = await this.AuctionToken.balanceOf(this.signers.beneficiary2.address)

        await expect(this.Crowdsale['withdrawTokens(address)'](this.signers.beneficiary1.address))
          .to.emit(this.Crowdsale, 'TokensWithdrawn')
          .withArgs(this.AuctionToken.address, this.signers.beneficiary1.address, expectedTokenAmount)
        await expect(this.Crowdsale['withdrawTokens(address)'](this.signers.beneficiary2.address))
          .to.emit(this.Crowdsale, 'TokensWithdrawn')
          .withArgs(this.AuctionToken.address, this.signers.beneficiary2.address, expectedTokenAmount)

        const beneficiary1balanceAfter = await this.AuctionToken.balanceOf(this.signers.beneficiary1.address)
        const beneficiary2balanceAfter = await this.AuctionToken.balanceOf(this.signers.beneficiary2.address)

        expect(beneficiary1balanceAfter.sub(beneficiary1balanceBefore)).to.equal(expectedTokenAmount)
        expect(beneficiary2balanceAfter.sub(beneficiary2balanceBefore)).to.equal(expectedTokenAmount)
      })

      it('withdraw tokens goal not reached', async function () {
        await setStartTime(this.Crowdsale)
        const commitment = CROWDSALE_GOAL.div(2)
        await buyTokensEth(this.Crowdsale, this.signers.beneficiary1, commitment)
        await setEndTime(this.Crowdsale)
        await this.Crowdsale.finalize()

        const ethBalanceBefore = await this.signers.beneficiary1.getBalance()
        const tokenBalanceBefore = await this.AuctionToken.balanceOf(this.signers.beneficiary1.address)
        await expect(this.Crowdsale['withdrawTokens(address)'](this.signers.beneficiary1.address))
          .to.emit(this.Crowdsale, 'TokensWithdrawn')
          .withArgs(ETH_ADDRESS, this.signers.beneficiary1.address, commitment)
        const ethBalanceAfter = await this.signers.beneficiary1.getBalance()
        const tokenBalanceAfter = await this.AuctionToken.balanceOf(this.signers.beneficiary1.address)

        // Prevent double spends
        expect(await this.Crowdsale.commitments(this.signers.beneficiary1.address)).to.equal(0)

        expect(ethBalanceAfter.sub(ethBalanceBefore)).to.equal(commitment)
        expect(tokenBalanceAfter.sub(tokenBalanceBefore)).to.equal(0)
      })

      it('withdraw tokens before auction close', async function () {
        await setStartTime(this.Crowdsale)
        await buyTokensEth(this.Crowdsale, this.signers.beneficiary1, BigInt(1))
        await expect(this.Crowdsale['withdrawTokens(address)'](this.signers.beneficiary1.address)).to.be.revertedWith(
          'Crowdsale: auction has not finished yet'
        )
      })
    })

    it('token balance', async function () {
      expect(await this.AuctionToken.balanceOf(this.Crowdsale.address)).to.equal(CROWDSALE_TOKENS)
    })

    it('finalize time expired', async function () {
      expect(await this.Crowdsale.finalizeTimeExpired()).to.equal(false)
    })

    it('commitments', async function () {
      await setStartTime(this.Crowdsale)
      const amount = BigNumber.from(5).mul(_1e18)
      await buyTokensEth(this.Crowdsale, this.signers.beneficiary1, amount)
      expect(await this.Crowdsale.commitments(this.signers.beneficiary1.address)).to.equal(amount)
    })

    it('finalize', async function () {
      await setStartTime(this.Crowdsale)
      await buyTokensEth(this.Crowdsale, this.signers.beneficiary1, CROWDSALE_GOAL)

      const oldWalletBalance = await this.signers.wallet.getBalance()
      await setEndTime(this.Crowdsale)
      const crowdsaleBalance = await ethers.provider.getBalance(this.Crowdsale.address)
      const amountRaised = (await this.Crowdsale.marketStatus()).commitmentsTotal

      await expect(this.Crowdsale.connect(this.signers.owner).finalize())
        .to.emit(this.Crowdsale, 'AuctionFinalized')
        .and.to.emit(this.Crowdsale, 'TokensWithdrawn')
        .withArgs(ETH_ADDRESS, this.signers.wallet.address, amountRaised)
      expect(await this.signers.wallet.getBalance()).to.equal(oldWalletBalance.add(crowdsaleBalance))

      await expect(this.Crowdsale.finalize()).to.be.revertedWith('Crowdsale: already finalized')
    })

    it('finalize not closed', async function () {
      await expect(this.Crowdsale.finalize()).to.be.revertedWith('Crowdsale: Has not finished yet')
    })

    it('finalize goal not reached', async function () {
      await setStartTime(this.Crowdsale)
      await buyTokensEth(this.Crowdsale, this.signers.beneficiary1, CROWDSALE_GOAL.div(2))
      await setEndTime(this.Crowdsale)

      const totalTokens = (await this.Crowdsale.marketInfo()).totalTokens
      const balanceBeforeFinalized = await this.AuctionToken.balanceOf(this.signers.wallet.address)
      await expect(this.Crowdsale.finalize())
        .to.emit(this.Crowdsale, 'AuctionFinalized')
        .and.to.emit(this.Crowdsale, 'TokensWithdrawn')
        .withArgs(this.AuctionToken.address, this.signers.wallet.address, totalTokens)

      const balanceAfterFinalized = await this.AuctionToken.balanceOf(this.signers.wallet.address)
      expect(balanceAfterFinalized).to.equal(balanceBeforeFinalized.add(totalTokens))
    })
  })

  describe('payment token erc20', async function () {
    beforeEach('', async function () {
      const { AuctionToken, PaymentToken, Crowdsale } = await CrowdsaleERC20()
      this.AuctionToken = AuctionToken
      this.PaymentToken = PaymentToken
      this.Crowdsale = Crowdsale
    })

    describe('buy tokens', async function () {
      it('buy with tokens', async function () {
        await setStartTime(this.Crowdsale)

        let balanceBefore
        let balanceAfter

        let expectedAmount

        const rate = (await this.Crowdsale.marketPrice()).rate
        const totalTokens = (await this.Crowdsale.marketInfo()).totalTokens
        const maxCommitment = totalTokens.mul(rate).div(_1e18)

        let totalAmountRaised = BigNumber.from(0)
        let tokensToTransfer = BigNumber.from(5).mul(_1e18)
        // Fund beneficiary 1
        await this.PaymentToken.transfer(this.signers.beneficiary1.address, tokensToTransfer)
        totalAmountRaised = totalAmountRaised.add(tokensToTransfer)
        balanceBefore = await this.PaymentToken.balanceOf(this.signers.beneficiary1.address)
        await buyTokensErc20(this.Crowdsale, this.PaymentToken, this.signers.beneficiary1, tokensToTransfer)
        balanceAfter = await this.PaymentToken.balanceOf(this.signers.beneficiary1.address)
        expect(balanceBefore.sub(balanceAfter)).to.equal(tokensToTransfer)

        tokensToTransfer = BigNumber.from(2).mul(_1e18)
        await this.PaymentToken.transfer(this.signers.beneficiary2.address, tokensToTransfer)
        totalAmountRaised = totalAmountRaised.add(tokensToTransfer)
        await buyTokensErc20(this.Crowdsale, this.PaymentToken, this.signers.beneficiary2, tokensToTransfer)

        expect((await this.Crowdsale.marketStatus()).commitmentsTotal).to.equal(totalAmountRaised)
        expect(await this.Crowdsale.auctionSuccessful()).to.equal(false)
        await expect(this.Crowdsale.finalize()).to.be.revertedWith('Crowdsale: Has not finished yet')

        // Max commitment is less than amount we're trying to use now
        tokensToTransfer = BigNumber.from(5).mul(_1e18)
        balanceBefore = await this.PaymentToken.balanceOf(this.signers.beneficiary2.address)
        await this.PaymentToken.transfer(this.signers.beneficiary2.address, tokensToTransfer)
        totalAmountRaised = totalAmountRaised.add(tokensToTransfer)
        await buyTokensErc20(this.Crowdsale, this.PaymentToken, this.signers.beneficiary2, tokensToTransfer)
        balanceAfter = await this.PaymentToken.balanceOf(this.signers.beneficiary2.address)
        expect(balanceAfter.sub(balanceBefore)).to.equal(totalAmountRaised.sub(maxCommitment))
        expect((await this.Crowdsale.marketStatus()).commitmentsTotal).to.equal(maxCommitment)

        await this.Crowdsale.finalize()

        expectedAmount = (await this.Crowdsale.commitments(this.signers.beneficiary1.address)).mul(rate).div(_1e18)
        await expect(this.Crowdsale['withdrawTokens(address)'](this.signers.beneficiary1.address))
          .to.emit(this.Crowdsale, 'TokensWithdrawn')
          .withArgs(this.AuctionToken.address, this.signers.beneficiary1.address, expectedAmount)
        expectedAmount = (await this.Crowdsale.commitments(this.signers.beneficiary2.address)).mul(rate).div(_1e18)
        await expect(this.Crowdsale['withdrawTokens(address)'](this.signers.beneficiary2.address))
          .to.emit(this.Crowdsale, 'TokensWithdrawn')
          .withArgs(this.AuctionToken.address, this.signers.beneficiary2.address, expectedAmount)
      })

      it('buy with eth', async function () {
        await setStartTime(this.Crowdsale)
        await expect(
          this.Crowdsale.commitEth(this.signers.beneficiary1.address, true, { value: 1 })
        ).to.be.revertedWith('Crowdsale: Payment currency is not ETH')
      })
    })
  })

  describe('init test', async function () {
    it('init done again', async function () {
      const { AuctionToken, Crowdsale } = await CrowdsaleETH()

      const startTime = BigNumber.from((await hre.ethers.provider.getBlock('latest')).timestamp + 1000)
      const endTime = startTime.add(CROWDSALE_TIME)

      await expect(
        Crowdsale.initCrowdsale(
          this.signers.owner.address,
          AuctionToken.address,
          ETH_ADDRESS,
          CROWDSALE_TOKENS,
          startTime,
          endTime,
          CROWDSALE_RATE,
          CROWDSALE_GOAL,
          this.signers.owner.address,
          ZERO_ADDRESS,
          this.signers.wallet.address
        )
      ).to.be.revertedWith('Already initialised')
    })

    it('init goal greater than total tokens', async function () {
      const goal = BigNumber.from(10).mul(_1e18)
      const totalTokens = _1e18
      const startTime = BigNumber.from((await hre.ethers.provider.getBlock('latest')).timestamp + 1000)
      const endTime = startTime.add(CROWDSALE_TIME)

      const auctionToken = await deployFixedToken('AuctionToken', 'AT', this.signers.owner.address, totalTokens)
      const crowdsale = (await (await ethers.getContractFactory('Crowdsale')).deploy()) as ICrowdsale
      await auctionToken.approve(crowdsale.address, totalTokens)
      await expect(
        crowdsale.functions.initCrowdsale(
          this.signers.owner.address,
          auctionToken.address,
          ETH_ADDRESS,
          totalTokens,
          startTime,
          endTime,
          CROWDSALE_RATE,
          goal,
          this.signers.owner.address,
          ZERO_ADDRESS,
          this.signers.wallet.address
        )
      ).to.be.revertedWith('Crowdsale: goal should be equal to or lower than total tokens')
    })

    it('init end time less than start time', async function () {
      const startTime = BigInt((await hre.ethers.provider.getBlock('latest')).timestamp + 1000)
      const endTime = BigInt(startTime) - BigInt(1)

      const auctionToken = await deployFixedToken('AuctionToken', 'AT', this.signers.owner.address, CROWDSALE_TOKENS)
      const crowdsale = (await (await ethers.getContractFactory('Crowdsale')).deploy()) as ICrowdsale
      await auctionToken.approve(crowdsale.address, CROWDSALE_TOKENS)
      await expect(
        crowdsale.functions.initCrowdsale(
          this.signers.owner.address,
          auctionToken.address,
          ETH_ADDRESS,
          CROWDSALE_TOKENS,
          startTime,
          endTime,
          CROWDSALE_RATE,
          CROWDSALE_GOAL,
          this.signers.owner.address,
          ZERO_ADDRESS,
          this.signers.wallet.address
        )
      ).to.be.revertedWith('Crowdsale: start time is not before end time')
    })

    it('init start time is before current time', async function () {
      const startTime = BigNumber.from((await hre.ethers.provider.getBlock('latest')).timestamp - 1)
      const endTime = startTime.add(CROWDSALE_TIME)

      const auctionToken = await deployFixedToken('AuctionToken', 'AT', this.signers.owner.address, CROWDSALE_TOKENS)
      const crowdsale = (await (await ethers.getContractFactory('Crowdsale')).deploy()) as ICrowdsale
      await auctionToken.approve(crowdsale.address, CROWDSALE_TOKENS)
      await expect(
        crowdsale.functions.initCrowdsale(
          this.signers.owner.address,
          auctionToken.address,
          ETH_ADDRESS,
          CROWDSALE_TOKENS,
          startTime,
          endTime,
          CROWDSALE_RATE,
          CROWDSALE_GOAL,
          this.signers.owner.address,
          ZERO_ADDRESS,
          this.signers.wallet.address
        )
      ).to.be.revertedWith('Crowdsale: start time is before current time')
    })

    it('init wallet is zero address', async function () {
      const startTime = BigNumber.from((await hre.ethers.provider.getBlock('latest')).timestamp + 1000)
      const endTime = startTime.add(CROWDSALE_TIME)

      const auctionToken = await deployFixedToken('AuctionToken', 'AT', this.signers.owner.address, CROWDSALE_TOKENS)
      const crowdsale = (await (await ethers.getContractFactory('Crowdsale')).deploy()) as ICrowdsale
      await auctionToken.approve(crowdsale.address, CROWDSALE_TOKENS)
      await expect(
        crowdsale.functions.initCrowdsale(
          this.signers.owner.address,
          auctionToken.address,
          ETH_ADDRESS,
          CROWDSALE_TOKENS,
          startTime,
          endTime,
          CROWDSALE_RATE,
          CROWDSALE_GOAL,
          this.signers.owner.address,
          ZERO_ADDRESS,
          ZERO_ADDRESS // <----
        )
      ).to.be.revertedWith('Crowdsale: wallet is the zero address')
    })

    it('init admin is zero address', async function () {
      const startTime = BigNumber.from((await hre.ethers.provider.getBlock('latest')).timestamp + 1000)
      const endTime = startTime.add(CROWDSALE_TIME)

      const auctionToken = await deployFixedToken('AuctionToken', 'AT', this.signers.owner.address, CROWDSALE_TOKENS)
      const crowdsale = (await (await ethers.getContractFactory('Crowdsale')).deploy()) as ICrowdsale
      await auctionToken.approve(crowdsale.address, CROWDSALE_TOKENS)
      await expect(
        crowdsale.functions.initCrowdsale(
          this.signers.owner.address,
          auctionToken.address,
          ETH_ADDRESS,
          CROWDSALE_TOKENS,
          startTime,
          endTime,
          CROWDSALE_RATE,
          CROWDSALE_GOAL,
          ZERO_ADDRESS, // <----
          ZERO_ADDRESS,
          this.signers.wallet.address
        )
      ).to.be.revertedWith('Crowdsale: admin is the zero address')
    })

    it('init rate is zero', async function () {
      const startTime = BigNumber.from((await hre.ethers.provider.getBlock('latest')).timestamp + 1000)
      const endTime = startTime.add(CROWDSALE_TIME)

      const auctionToken = await deployFixedToken('AuctionToken', 'AT', this.signers.owner.address, CROWDSALE_TOKENS)
      const crowdsale = (await (await ethers.getContractFactory('Crowdsale')).deploy()) as ICrowdsale
      await auctionToken.approve(crowdsale.address, CROWDSALE_TOKENS)
      await expect(
        crowdsale.functions.initCrowdsale(
          this.signers.owner.address,
          auctionToken.address,
          ETH_ADDRESS,
          CROWDSALE_TOKENS,
          startTime,
          endTime,
          0, // <----
          CROWDSALE_GOAL,
          this.signers.owner.address,
          ZERO_ADDRESS,
          this.signers.wallet.address
        )
      ).to.be.revertedWith('Crowdsale: rate is 0')
    })
  })

  describe('documentation test', async function () {
    beforeEach('', async function () {
      const { AuctionToken, Crowdsale } = await CrowdsaleETH()
      this.AuctionToken = AuctionToken
      this.Crowdsale = Crowdsale
    })

    it('set document zero value', async function () {
      await expect(this.Crowdsale.setDocument('', DOCUMENT_DATA)).to.be.revertedWith('Zero name is not allowed')
    })

    it('set document zero data length', async function () {
      await expect(this.Crowdsale.setDocument(DOCUMENT_NAME, '')).to.be.revertedWith('Should not be a empty data')
    })

    it('commit eth no agreement', async function () {
      await expect(this.Crowdsale.commitEth(this.signers.beneficiary1.address, false)).to.be.revertedWith(
        'No agreement provided, please review the smart contract before interacting with it'
      )
    })
  })
})

// Helper functions
export async function deployCrowdsale(
  funder: string,
  auctionToken: IFixedToken,
  paymentToken: string, // can be ETH
  totalTokens: BigNumberish,
  startTime: BigNumberish,
  endTime: BigNumberish,
  rate: BigNumberish,
  goal: BigNumberish,
  admin: string,
  pointList: string,
  wallet: string
) {
  const crowdsale = (await (await ethers.getContractFactory('Crowdsale'))
    .connect(await ethers.getSigner(funder))
    .deploy()) as ICrowdsale
  await auctionToken.approve(crowdsale.address, totalTokens)
  await crowdsale.functions.initCrowdsale(
    funder,
    auctionToken.address,
    paymentToken,
    totalTokens,
    startTime,
    endTime,
    rate,
    goal,
    admin,
    pointList,
    wallet
  )

  return crowdsale
}

async function buyTokensErc20(
  crowdsale: ICrowdsale,
  paymentToken: IFixedToken,
  signer: SignerWithAddress,
  amount: BigNumberish
) {
  const commitmentsTotalBefore = (await crowdsale.marketStatus()).commitmentsTotal
  const rate = (await crowdsale.marketPrice()).rate
  const totalTokens = (await crowdsale.marketInfo()).totalTokens
  const maxCommitment = totalTokens.mul(rate).div(_1e18).sub(commitmentsTotalBefore)
  await paymentToken.connect(signer).approve(crowdsale.address, amount)
  await expect(crowdsale.connect(signer).commitTokens(amount, true)).to.emit(crowdsale, 'AddedCommitment')
  expect((await crowdsale.marketStatus()).commitmentsTotal).to.equal(
    commitmentsTotalBefore.add(BigNumber.from(amount).lt(maxCommitment) ? amount : maxCommitment)
  )
}

async function buyTokensEth(crowdsale: ICrowdsale, signer: SignerWithAddress, amount: BigNumberish) {
  const commitmentsTotalBefore = (await crowdsale.marketStatus()).commitmentsTotal
  const rate = (await crowdsale.marketPrice()).rate
  const totalTokens = (await crowdsale.marketInfo()).totalTokens
  const maxCommitment = totalTokens.mul(rate).div(_1e18).sub(commitmentsTotalBefore)
  await expect(crowdsale.connect(signer).commitEth(signer.address, true, { value: amount })).to.emit(
    crowdsale,
    'AddedCommitment'
  )
  expect((await crowdsale.marketStatus()).commitmentsTotal).to.equal(
    commitmentsTotalBefore.add(BigNumber.from(amount).lt(maxCommitment) ? amount : maxCommitment)
  )
}
