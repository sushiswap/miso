import { BigNumber } from "@ethersproject/bignumber";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployFunction: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  ethers,
}: HardhatRuntimeEnvironment) {
  console.log("Running MISOTokenFactory deploy script");
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const accessControls = await ethers.getContract("MISOAccessControls");

  const { address } = await deploy("MISOTokenFactory", {
    from: deployer,
    log: true,
    deterministicDeployment: false,
  });

  console.log("MISOTokenFactory deployed at ", address);

  const misoTokenFactory = await ethers.getContract("MISOTokenFactory");

  if (
    (await misoTokenFactory.accessControls()) === ethers.constants.AddressZero
  ) {
    console.log("MISOTokenFactory initilising");
    await (
      await misoTokenFactory.initMISOTokenFactory(accessControls.address)
    ).wait();
    console.log("MISOTokenFactory initilised");
  }

  const templateId: BigNumber = await misoTokenFactory.tokenTemplateId();

  if (templateId.toNumber() === 0) {
    const fixedToken = await ethers.getContract("FixedToken");
    console.log("MISOTokenFactory adding FixedToken");
    await (await misoTokenFactory.addTokenTemplate(fixedToken.address)).wait();
    console.log("MISOTokenFactory added FixedToken");

    const mintableToken = await ethers.getContract("MintableToken");
    console.log("MISOTokenFactory adding MintableToken");
    await (
      await misoTokenFactory.addTokenTemplate(mintableToken.address)
    ).wait();
    console.log("MISOTokenFactory added MintableToken");

    const sushiToken = await ethers.getContract("SushiToken");
    console.log("MISOTokenFactory adding SushiToken");
    await (await misoTokenFactory.addTokenTemplate(sushiToken.address)).wait();
    console.log("MISOTokenFactory added SushiToken");
  }
};

export default deployFunction;

deployFunction.dependencies = [
  "MISOAccessControls",
  "FixedToken",
  "MintableToken",
  "SushiToken",
  "GovToken",
];

deployFunction.tags = ["MISOTokenFactory"];
