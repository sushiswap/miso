import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import contract from "@openzeppelin/contracts/build/contracts/ERC20.json";

const deployFunction: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  console.log("Running WrappedNative deploy script");
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const { address } = await deploy("WrappedNative", {
    contract,
    from: deployer,
    args: ["Wrapped Native", "WNATIVE"],
    log: true,
    deterministicDeployment: false,
  });

  console.log("WrappedNative deployed at ", address);
};

export default deployFunction;

deployFunction.skip = async ({ getChainId }) => {
  const chainId = parseInt(await getChainId());
  return chainId !== 31337;
};

deployFunction.dependencies = [];

deployFunction.tags = ["WrappedNative"];
