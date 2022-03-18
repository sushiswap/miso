import { task } from 'hardhat/config'

task('add-minter', 'Adds minter')
  .addParam('address', 'New minter')
  .setAction(async function ({ address }, { ethers: { getNamedSigner, getContract } }) {
    const admin = await getNamedSigner('admin')

    console.log(`Admin is ${admin.address}`)

    const accessControl = await getContract('MISOAccessControls', admin)

    console.log('Adding minter...')

    await (await accessControl.addMinterRole(address)).wait()

    console.log('Minter added!')
  })
