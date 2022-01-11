import { task } from "hardhat/config";

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
