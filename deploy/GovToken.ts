import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployFunction: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  console.log("Running GovToken deploy script");
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const { address } = await deploy("GovToken", {
    from: deployer,
    log: true,
    deterministicDeployment: false,
  });

  console.log("GovToken deployed at ", address);
};

export default deployFunction;

deployFunction.dependencies = [];

deployFunction.tags = ["GovToken"];
