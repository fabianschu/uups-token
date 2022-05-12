const { task } = require("hardhat/config");
const fs = require("fs/promises");

task("upgrade", "Upgrades token contract")
  .addPositionalParam("proxy")
  .addPositionalParam("upgrade")
  .addPositionalParam("abacus")
  .setAction(async (taskArgs, { ethers, network, upgrades }) => {
    const { proxy, upgrade, abacus } = taskArgs;

    const deployments = JSON.parse(
      await fs.readFile(`deployments/${network.name}.json`)
    );

    const idx = deployments.findIndex((d) => d.address === proxy);
    const deployment = deployments[idx];

    console.log(
      `upgrade ${deployment.name} at ${deployment.address} on ${network.name}`
    );

    console.log(`new implementation: ${upgrade}`);

    const UpgradedContract = await ethers.getContractFactory(upgrade);
    const upgradedContract = await upgrades.upgradeProxy(
      proxy,
      UpgradedContract,
      {
        call: { fn: "upgradeFunction", args: [abacus] },
      }
    );

    console.log(`tx: ${upgradedContract.deployTransaction.hash}`);

    await upgradedContract.deployed();

    console.log(`${upgrade} deployed for proxy at`, proxy);

    const implementation = await upgrades.erc1967.getImplementationAddress(
      upgradedContract.address
    );

    console.log(`new implementation address: `, implementation);

    deployments[idx] = {
      name: upgrade,
      address: upgradedContract.address,
      deployTx: upgradedContract.deployTransaction.hash,
      chainId: network.provider.chainId,
      implementation,
    };

    await fs.writeFile(
      `deployments/${network.name}.json`,
      JSON.stringify(deployments, null, 2)
    );
  });
