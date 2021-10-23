import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployFunction: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  console.log("Running Crowdsale deploy script");
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const { address } = await deploy("Crowdsale", {
    from: deployer,
    log: true,
    deterministicDeployment: false,
  });

  console.log("Crowdsale deployed at ", address);
};

export default deployFunction;

deployFunction.dependencies = [];

deployFunction.tags = ["Crowdsale"];
