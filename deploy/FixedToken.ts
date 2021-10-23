import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployFunction: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  console.log("Running FixedToken deploy script");
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const { address } = await deploy("FixedToken", {
    from: deployer,
    log: true,
    deterministicDeployment: false,
  });

  console.log("FixedToken deployed at ", address);
};

export default deployFunction;

deployFunction.dependencies = [];

deployFunction.tags = ["FixedToken"];
