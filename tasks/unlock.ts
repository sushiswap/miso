import { task } from "hardhat/config";

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

  if (
    !marketLocked &&
    !farmFactoryLocked &&
    !launcherLocked &&
    !tokenFactoryLocked
  ) {
    console.log("Already locked!");
  }

  if (!marketLocked) {
    console.log("Unlocking market...");
    await (await market.setLocked(false)).wait();
    console.log("Unlocked market...");
  }
  if (!farmFactoryLocked) {
    console.log("Unlocking farm factory'..");
    await (await farmFactory.setLocked(false)).wait();
    console.log("Unlocked farm factory'..");
  }
  if (!launcherLocked) {
    console.log("Unlocking launcher'...");
    await (await launcher.setLocked(false)).wait();
    console.log("Unlocked launcher'...");
  }
  if (!tokenFactoryLocked) {
    console.log("Unlocking token factory...");
    await (await tokenFactory.setLocked(false)).wait();
    console.log("Unlocked token factory...");
  }

  console.log("Unlocked!");
});
