import { BigNumber } from "@ethersproject/bignumber";
import { BENTOBOX_ADDRESS } from "@sushiswap/core-sdk";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployFunction: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  ethers,
  getChainId,
}: HardhatRuntimeEnvironment) {
  console.log("Running MISOMarket deploy script");

  const chainId = parseInt(await getChainId());

  if (!(chainId in BENTOBOX_ADDRESS)) {
    throw Error(`No BentoBox address for chain ${chainId}!`);
  }

  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const { address } = await deploy("MISOMarket", {
    from: deployer,
    log: true,
    deterministicDeployment: false,
  });

  console.log("MISOMarket deployed at ", address);

  const misoMarket = await ethers.getContract("MISOMarket");

  const templateId: BigNumber = await misoMarket.auctionTemplateId();

  if (templateId.toNumber() === 0) {
    const accessControls = await ethers.getContract("MISOAccessControls");
    const batchAuction = await ethers.getContract("BatchAuction");
    const crowdsale = await ethers.getContract("Crowdsale");
    const dutchAuction = await ethers.getContract("DutchAuction");
    const hyperbolicAuction = await ethers.getContract("HyperbolicAuction");
    console.log("MISOMarket initilising");
    await (
      await misoMarket.initMISOMarket(
        accessControls.address,
        BENTOBOX_ADDRESS[chainId],
        [
          batchAuction.address,
          crowdsale.address,
          dutchAuction.address,
          hyperbolicAuction.address,
        ],
        {
          from: deployer,
        }
      )
    ).wait();
    console.log("MISOMarket initilising");
  }
};

export default deployFunction;

deployFunction.dependencies = [
  "MISOAccessControls",
  "BatchAuction",
  "Crowdsale",
  "DutchAuction",
  "HyperbolicAuction",
];

deployFunction.tags = ["MISOMarket"];
