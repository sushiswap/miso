import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running WrappedNative deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  const { address } = await deploy('WrappedNative', {
    contract: 'WETH9',
    from: deployer,
    log: true,
    deterministicDeployment: false,
  })

  console.log('WrappedNative deployed at ', address)
}

export default deployFunction

deployFunction.skip = async ({ getChainId }) => {
  const chainId = parseInt(await getChainId())
  return chainId !== 31337
}

deployFunction.dependencies = []

deployFunction.tags = ['WrappedNative']
