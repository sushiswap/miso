import { FACTORY_ADDRESS, WNATIVE_ADDRESS } from "@sushiswap/core-sdk";
import { task } from "hardhat/config";
import { NomicLabsHardhatPluginError } from "hardhat/plugins";

task(
  "verify:all",
  "Verify all contracts",
  async (_, { ethers, tenderly, run, getChainId }) => {
    const chainId = parseInt(await getChainId());

    const batchAuction = await ethers.getContract("BatchAuction");
    const crowdsale = await ethers.getContract("Crowdsale");
    const dutchAuction = await ethers.getContract("DutchAuction");
    const fixedToken = await ethers.getContract("FixedToken");
    const hyperbolicAuction = await ethers.getContract("HyperbolicAuction");
    const listFactory = await ethers.getContract("ListFactory");
    const mintableToken = await ethers.getContract("MintableToken");
    const accessControls = await ethers.getContract("MISOAccessControls");
    const farmFactory = await ethers.getContract("MISOFarmFactory");
    const helper = await ethers.getContract("MISOHelper");
    const launcher = await ethers.getContract("MISOLauncher");
    const market = await ethers.getContract("MISOMarket");
    const masterChef = await ethers.getContract("MISOMasterChef");
    const tokenFactory = await ethers.getContract("MISOTokenFactory");
    const pointList = await ethers.getContract("PointList");
    const postAuctionLauncher = await ethers.getContract("PostAuctionLauncher");
    const sushiToken = await ethers.getContract("SushiToken");
    const auctionCreation = await ethers.getContract("AuctionCreation");
    const govToken = await ethers.getContract("GovToken");
    const contracts: {
      name: string;
      address: string;
      constructorArguments?: string[];
    }[] = [
      {
        name: "BatchAuction",
        address: batchAuction.address,
      },
      {
        name: "Crowdsale",
        address: crowdsale.address,
      },
      {
        name: "DutchAuction",
        address: dutchAuction.address,
      },
      {
        name: "FixedToken",
        address: fixedToken.address,
      },
      {
        name: "HyperbolicAuction",
        address: hyperbolicAuction.address,
      },
      {
        name: "ListFactory",
        address: listFactory.address,
      },
      {
        name: "MintableToken",
        address: mintableToken.address,
      },
      {
        name: "MISOAccessControls",
        address: accessControls.address,
      },
      {
        name: "MISOFarmFactory",
        address: farmFactory.address,
      },
      {
        name: "MISOHelper",
        address: helper.address,
        constructorArguments: [
          accessControls.address,
          tokenFactory.address,
          market.address,
          launcher.address,
          farmFactory.address,
        ],
      },
      {
        name: "MISOLauncher",
        address: launcher.address,
      },
      {
        name: "MISOMarket",
        address: market.address,
      },
      {
        name: "MISOMasterChef",
        address: masterChef.address,
      },
      {
        name: "MISOTokenFactory",
        address: tokenFactory.address,
      },
      {
        name: "PointList",
        address: pointList.address,
      },
      {
        name: "PostAuctionLauncher",
        address: postAuctionLauncher.address,
        constructorArguments: [WNATIVE_ADDRESS[chainId]],
      },
      {
        name: "SushiToken",
        address: sushiToken.address,
      },
      {
        name: "AuctionCreation",
        address: auctionCreation.address,
        constructorArguments: [
          tokenFactory.address,
          listFactory.address,
          launcher.address,
          market.address,
          FACTORY_ADDRESS[chainId],
        ],
      },
      {
        name: "GovToken",
        address: govToken.address,
      },
    ];

    for (const { address, constructorArguments } of contracts) {
      try {
        await run("verify:verify", {
          address,
          constructorArguments,
        });
      } catch (error) {
        if (error instanceof NomicLabsHardhatPluginError) {
          console.debug(error.message);
        }
      }
    }
    await tenderly.verify(contracts);
  }
);

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, { ethers }) => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.address);
  }
});

task("add:token", "Adds token")
  .addParam("address", "New Token")
  .setAction(async function (
    { address },
    { ethers: { getNamedSigner, getContract } }
  ) {
    const admin = await getNamedSigner("admin");

    const misoTokenFactory = await getContract("MISOTokenFactory", admin);

    console.log("Adding token...");

    await (await misoTokenFactory.addTokenTemplate(address)).wait();

    console.log("Token added!");
  });

task("add:admin", "Adds admin")
  .addParam("address", "New Admin")
  .setAction(async function (
    { address },
    { ethers: { getNamedSigner, getContract } }
  ) {
    const admin = await getNamedSigner("admin");

    const accessControl = await getContract("MISOAccessControl", admin);

    console.log("Adding admin...");

    await (await accessControl.addAdminRole(address)).wait();

    console.log("Admin added!");
  });

task("unlock", "Unlocks MISO").setAction(async function (
  _,
  { ethers: { getNamedSigner, getContract } }
) {
  const admin = await getNamedSigner("admin");

  const market = await getContract("MISOMarket", admin);
  const farmFactory = await getContract("MISOFarmFactory", admin);
  const launcher = await getContract("MISOLauncher", admin);
  const tokenFactory = await getContract("MISOTokenFactory", admin);

  const marketLocked = await market.locked();
  const farmFactoryLocked = await farmFactory.locked();
  const launcherLocked = await launcher.locked();
  const tokenFactoryLocked = await tokenFactory.locked();

  console.log("Unlocking...");

  if (marketLocked) {
    await (await market.setLocked(false)).wait();
  }
  if (farmFactoryLocked) {
    await (await farmFactory.setLocked(false)).wait();
  }
  if (launcherLocked) {
    await (await launcher.setLocked(false)).wait();
  }
  if (tokenFactoryLocked) {
    await (await tokenFactory.setLocked(false)).wait();
  }

  console.log("Unlocked!");
});

task("lock", "Locks MISO").setAction(async function (
  _,
  { ethers: { getNamedSigner, getContract } }
) {
  const admin = await getNamedSigner("admin");

  const market = await getContract("MISOMarket", admin);
  const farmFactory = await getContract("MISOFarmFactory", admin);
  const launcher = await getContract("MISOLauncher", admin);
  const tokenFactory = await getContract("MISOTokenFactory", admin);

  const marketLocked = await market.locked();
  const farmFactoryLocked = await farmFactory.locked();
  const launcherLocked = await launcher.locked();
  const tokenFactoryLocked = await tokenFactory.locked();

  console.log("Locking ...");

  if (!marketLocked) {
    await (await market.setLocked(true)).wait();
  }
  if (!farmFactoryLocked) {
    await (await farmFactory.setLocked(true)).wait();
  }
  if (!launcherLocked) {
    await (await launcher.setLocked(true)).wait();
  }
  if (!tokenFactoryLocked) {
    await (await tokenFactory.setLocked(true)).wait();
  }

  console.log("Locked!");
});
