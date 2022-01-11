import { task } from "hardhat/config";

task("lock", "Lock").setAction(async function (
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
    marketLocked &&
    farmFactoryLocked &&
    launcherLocked &&
    tokenFactoryLocked
  ) {
    console.log("Already locked!");
  }

  if (!marketLocked) {
    console.log("Locking market...");
    await (await market.setLocked(true)).wait();
    console.log("Locked market...");
  }
  if (!farmFactoryLocked) {
    console.log("Locking farm factory'..");
    await (await farmFactory.setLocked(true)).wait();
    console.log("Locked farm factory'..");
  }
  if (!launcherLocked) {
    console.log("Locking launcher'...");
    await (await launcher.setLocked(true)).wait();
    console.log("Locked launcher'...");
  }
  if (!tokenFactoryLocked) {
    console.log("Locking token factory...");
    await (await tokenFactory.setLocked(true)).wait();
    console.log("Locked token factory...");
  }
});
