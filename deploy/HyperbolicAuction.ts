import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running HyperbolicAuction deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  const { address } = await deploy('HyperbolicAuction', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
  })

  console.log('HyperbolicAuction deployed at ', address)
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['HyperbolicAuction']
