import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployFunction: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  ethers,
}: HardhatRuntimeEnvironment) {
  console.log("Running MISOHelper deploy script");
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const accessControls = await ethers.getContract("MISOAccessControls");
  const tokenFactory = await ethers.getContract("MISOTokenFactory");
  const market = await ethers.getContract("MISOMarket");
  const launcher = await ethers.getContract("MISOLauncher");
  const farmFactory = await ethers.getContract("MISOFarmFactory");

  const { address } = await deploy("MISOHelper", {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    args: [
      accessControls.address,
      tokenFactory.address,
      market.address,
      launcher.address,
      farmFactory.address,
    ],
  });

  console.log("MISOHelper deployed at ", address);
};

export default deployFunction;

deployFunction.dependencies = [
  "MISOAccessControls",
  "MISOTokenFactory",
  "MISOMarket",
  "MISOLauncher",
  "MISOFarmFactory",
];

deployFunction.tags = ["MISOHelper"];
