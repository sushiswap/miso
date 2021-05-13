import { WETH } from "@sushiswap/sdk"
import { BigNumber } from "ethers"
import contracts from "../scripts/contracts"

export default async ({ ethers, getNamedAccounts, deployments, getChainId }) => {
    const { deployer, admin } = await getNamedAccounts()

    //  When deployed, should the contracts be unlocked?
    const unlock = true

    // miso access control
    const accessControlAddress = await contracts.deployAccessControls(deployer)
    const accessControl = await ethers.getContractAt("MISOAccessControls", accessControlAddress)

    if (!(await accessControl.hasAdminRole(admin))) {
        accessControl.addAdminRole(admin, { from: deployer })
    }

    if (!(await accessControl.hasAdminRole(deployer))) {
        accessControl.addAdminRole(deployer, { from: admin })
    }


    // Setup MISOTokenFactory
    const fixedToken = await contracts.deployContract("FixedToken", deployer)
    const mintableToken = await contracts.deployContract("MintableToken", deployer)
    const sushiToken = await contracts.deployContract("SushiToken", deployer)
    const tokenFactoryAddress = await contracts.deployTokenFactory(accessControlAddress, deployer)

    const misoTokenFactory = await ethers.getContractAt("MISOTokenFactory", tokenFactoryAddress)
    const templateId: BigNumber = await misoTokenFactory.tokenTemplateId()

    if (templateId.toNumber() === 0) {
        await (await misoTokenFactory.addTokenTemplate(fixedToken, { from: deployer })).wait()
        await (await misoTokenFactory.addTokenTemplate(mintableToken, { from: deployer })).wait()
        await (await misoTokenFactory.addTokenTemplate(sushiToken, { from: deployer })).wait()
    }

    // Setup MISO Market
    const bentoBox = await contracts.deployContract("BoringFactory", deployer)
    const crowdsale = await contracts.deployContract("Crowdsale", deployer)
    const dutchAuction = await contracts.deployContract("DutchAuction", deployer)
    const batchAuction = await contracts.deployContract("BatchAuction", deployer)
    const hyperbolicAuction = await contracts.deployContract("HyperbolicAuction", deployer)
    const marketAddress = await contracts.deployMisoMarket(
        accessControlAddress,
        bentoBox,
        [crowdsale, dutchAuction, batchAuction, hyperbolicAuction],
        deployer
    )

    const misoMarket = await ethers.getContractAt("MISOMarket", marketAddress)

    // Setup PointList
    const pointList = await contracts.deployContract("PointList", deployer)
    await contracts.deployPointListFactory(pointList, accessControlAddress, 0, deployer)


    // MISOLauncher
    const chainId = await getChainId()
    let wethAddress

    if (chainId in WETH) {
        wethAddress = WETH[chainId].address
    } else {
        throw Error("No WETH!")
    }

    const postAuction = await contracts.deployContract("PostAuctionLauncher", deployer, [wethAddress])
    const launcherAddress = await contracts.deployMisoLauncher(accessControlAddress, wethAddress, bentoBox, deployer)

    const misoLauncher = await ethers.getContractAt("MISOLauncher", launcherAddress)
    const launcherTemplateId: BigNumber = await misoLauncher.launcherTemplateId()

    if (launcherTemplateId.toNumber() == 0) {
        await (await misoLauncher.addLiquidityLauncherTemplate(postAuction, { from: deployer })).wait()
    }

    // MISOFarmFactory
    const masterchef = await contracts.deployContract("MISOMasterChef", deployer)
    const farmFactoryAddress = await contracts.deployFarmFactory(accessControlAddress, deployer, 0, 0, deployer)

    const farmFactory = await ethers.getContractAt("MISOFarmFactory", farmFactoryAddress)
    const farmTemplateId: BigNumber = await farmFactory.farmTemplateId()

    if (farmTemplateId.toNumber() == 0) {
        await (
            await farmFactory.addFarmTemplate(
                masterchef,
                { from: deployer }
            )
        ).wait()
    }


    // Helper contract
    await contracts.deployMisoHelper(
        accessControlAddress,
        tokenFactoryAddress,
        marketAddress,
        launcherAddress,
        farmFactoryAddress,
        deployer
    )


    // Set Factory lock status
    const marketLocked = await misoMarket.locked()
    const farmFactoryLocked = await farmFactory.locked()
    const launcherLocked = await misoLauncher.locked()
    const tokenFactoryLocked = await misoTokenFactory.locked()
    if (unlock && marketLocked) {
        await (await misoMarket.setLocked(false, { from: deployer })).wait()
    }
    if (unlock && farmFactoryLocked) {
        await (await farmFactory.setLocked(false, { from: deployer })).wait()
    }
    if (unlock && launcherLocked) {
        await (await misoLauncher.setLocked(false, { from: deployer })).wait()
    }
    if (unlock && tokenFactoryLocked) {
        await (await misoTokenFactory.setLocked(false, { from: deployer })).wait()
    }

    // Revoke deployer admin rights
    accessControl.removeOperatorRole(deployer, {'from': deployer})
    accessControl.removeAdminRole(deployer, {'from': deployer})

}