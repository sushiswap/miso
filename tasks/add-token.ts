import { task } from "hardhat/config";

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
