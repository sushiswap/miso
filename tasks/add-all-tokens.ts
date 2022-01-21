import { task } from "hardhat/config";

// import {
//   FixedToken,
//   MintableToken,
//   MISOTokenFactory,
//   SushiToken,
// } from "../typechain";

task("add-all-tokens", "Adds token").setAction(async function (
  _,
  { ethers: { getNamedSigner, getContract } }
) {
  // const admin = await getNamedSigner("admin");
  // const misoTokenFactory = await getContract<MISOTokenFactory>(
  //   "MISOTokenFactory",
  //   admin
  // );
  // const fixedToken = await getContract<FixedToken>("FixedToken", admin);
  // const mintableToken = await getContract<MintableToken>(
  //   "MintableToken",
  //   admin
  // );
  // const sushiToken = await getContract<SushiToken>("SushiToken", admin);
  // console.log("Adding tokens...");
  // await Promise.all([
  //   await misoTokenFactory
  //     .addTokenTemplate(fixedToken.address)
  //     .then((tx) => tx.wait(3)),
  //   await misoTokenFactory
  //     .addTokenTemplate(mintableToken.address)
  //     .then((tx) => tx.wait(3)),
  //   await misoTokenFactory
  //     .addTokenTemplate(sushiToken.address)
  //     .then((tx) => tx.wait(3)),
  // ]);
  // console.log("Tokens added!");
});
