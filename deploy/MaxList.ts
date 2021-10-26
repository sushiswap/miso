import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployFunction: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  console.log("Running MaxList deploy script");
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const { address } = await deploy("MaxList", {
    from: deployer,
    log: true,
    deterministicDeployment: false,
  });

  console.log("MaxList deployed at ", address);
};

export default deployFunction;

deployFunction.dependencies = [];

deployFunction.tags = ["MaxList"];
