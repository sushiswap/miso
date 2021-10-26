import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { WNATIVE_ADDRESS } from "@sushiswap/core-sdk";

const deployFunction: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  getChainId,
}: HardhatRuntimeEnvironment) {
  console.log("Running PostAuctionLauncher deploy script");

  const chainId = parseInt(await getChainId());

  if (!(chainId in WNATIVE_ADDRESS)) {
    throw Error(`No WETH address for chain ${chainId}!`);
  }

  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const { address } = await deploy("PostAuctionLauncher", {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    args: [WNATIVE_ADDRESS[chainId]],
  });

  console.log("PostAuctionLauncher deployed at ", address);
};

export default deployFunction;

deployFunction.dependencies = [];

deployFunction.tags = ["PostAuctionLauncher"];
