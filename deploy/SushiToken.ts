import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running SushiToken deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  const { address } = await deploy('SushiToken', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
  })

  console.log('SushiToken deployed at ', address)
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['SushiToken']
