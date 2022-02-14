import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const deployFunction: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  ethers,
}: HardhatRuntimeEnvironment) {
  console.log('Running ListFactory deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  const { address } = await deploy('ListFactory', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
  })

  console.log('ListFactory deployed at ', address)

  const listFactory = await ethers.getContract('ListFactory')

  const accessControl = await ethers.getContract('MISOAccessControls')
  const pointList = await ethers.getContract('PointList')

  if ((await listFactory.accessControls()) === ethers.constants.AddressZero) {
    console.log('ListFactory initilising')
    await (
      await listFactory.initListFactory(
        accessControl.address,
        pointList.address,
        0 // point list fee
      )
    ).wait()
    console.log('ListFactory initilised')
  }
}

export default deployFunction

deployFunction.dependencies = ['MISOAccessControls', 'PointList']

deployFunction.tags = ['ListFactory']
