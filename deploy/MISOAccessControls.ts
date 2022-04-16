import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const deployFunction: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  ethers,
}: HardhatRuntimeEnvironment) {
  console.log('Running MISOAccessControls deploy script')
  const { deploy } = deployments

  const { deployer, admin } = await getNamedAccounts()

  const { address } = await deploy('MISOAccessControls', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
  })

  console.log('MISOAccessControls deployed at ', address)

  const accessControls = await ethers.getContract('MISOAccessControls')

  if (!(await accessControls.hasAdminRole(deployer))) {
    console.log('MISOAccessControls initilising')
    try {
      await (await accessControls.initAccessControls(deployer)).wait()
    } catch (error) {
      console.log('MISOAccessControls error', error)
    }
    console.log('MISOAccessControls initilised')
  }

  if (!(await accessControls.hasAdminRole(admin))) {
    console.log('MISOAccessControls adding ' + admin + 'as admin')
    await (await accessControls.addAdminRole(admin)).wait()
    console.log('MISOAccessControls added ' + admin + 'as admin')
  }
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['MISOAccessControls']
