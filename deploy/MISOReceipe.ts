import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { FACTORY_ADDRESS } from "@sushiswap/core-sdk";

const deployFunction: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  getChainId,
}: HardhatRuntimeEnvironment) {
  console.log("Running MISOReceipe deploy script");

  const chainId = parseInt(await getChainId());

  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const { address } = await deploy("MISOReceipe", {
    from: deployer,
    log: true,
    args: [
      (await deployments.get("MISOTokenFactory")).address,
      (await deployments.get("ListFactory")).address,
      (await deployments.get("MISOLauncher")).address,
      (await deployments.get("MISOMarket")).address,
      FACTORY_ADDRESS[chainId],
    ],
    deterministicDeployment: false,
  });

  console.log("MISOReceipe deployed at ", address);
};

export default deployFunction;

deployFunction.dependencies = [
  "MISOTokenFactory",
  "ListFactory",
  "MISOLauncher",
  "MISOMarket",
];

deployFunction.tags = ["MISOReceipe"];
