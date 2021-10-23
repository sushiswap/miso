import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { BENTOBOX_ADDRESS } from "@sushiswap/core-sdk";
import { BigNumber } from "@ethersproject/bignumber";

const deployFunction: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  getChainId,
  ethers,
}: HardhatRuntimeEnvironment) {
  console.log("Running MISOFarmFactory deploy script");

  const chainId = parseInt(await getChainId());

  if (!(chainId in BENTOBOX_ADDRESS)) {
    throw Error(`No BentoBox address for chain ${chainId}!`);
  }

  const { deploy } = deployments;

  const { deployer, dev } = await getNamedAccounts();

  const { address } = await deploy("MISOFarmFactory", {
    from: deployer,
    log: true,
    deterministicDeployment: false,
  });

  console.log("MISOFarmFactory deployed at ", address);

  const farmFactory = await ethers.getContract("MISOFarmFactory");

  if ((await farmFactory.accessControls()) === ethers.constants.AddressZero) {
    console.log("MISOFarmFactory initilising");
    const accessControls = await ethers.getContract("MISOAccessControls");
    await (
      await farmFactory.initMISOFarmFactory(
        accessControls.address,
        dev,
        0, // minimum fee
        0 // token fee
      )
    ).wait();
    console.log("MISOFarmFactory initilised");
  }

  const farmTemplateId: BigNumber = await farmFactory.farmTemplateId();

  if (farmTemplateId.toNumber() == 0) {
    console.log("Adding MISOMasterChef to MISOFarmFactory");
    const masterChef = await ethers.getContract("MISOMasterChef");
    await (await farmFactory.addFarmTemplate(masterChef.address)).wait();
    console.log("Added MISOMasterChef to MISOFarmFactory");
  }
};

export default deployFunction;

deployFunction.dependencies = [
  "MISOAccessControls",
  "PostAuctionLauncher",
  "MISOMasterChef",
];

deployFunction.tags = ["MISOFarmFactory"];
