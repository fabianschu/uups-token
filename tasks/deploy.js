const { task } = require("hardhat/config");
const fs = require("fs/promises");

task("deploy", "Deploys implementation and proxy contract")
  .addPositionalParam("recipient")
  .setAction(async (taskArgs, { ethers, network, upgrades }) => {
    const ONE_BILLION = ethers.utils.parseEther((1_000_000_000).toString());

    const { recipient } = taskArgs;
    const contractName = "UupsToken";

    console.log(`deploying ${contractName} proxy to ${network.name}`);

    const UupsToken = await ethers.getContractFactory("UupsToken");
    const uupsToken = await upgrades.deployProxy(
      UupsToken,
      [recipient, ONE_BILLION],
      {
        kind: "uups",
      }
    );

    console.log(`tx: ${uupsToken.deployTransaction.hash}`);

    await uupsToken.deployed();

    console.log(`new ${contractName} proxy deployed to:`, uupsToken.address);

    const deployments = JSON.parse(
      await fs.readFile(`deployments/${network.name}.json`)
    );

    const implementation = await upgrades.erc1967.getImplementationAddress(
      uupsToken.address
    );

    deployments.push({
      name: contractName,
      address: uupsToken.address,
      deployTx: uupsToken.deployTransaction,
      chainId: network.provider.chainId,
      implementation,
    });

    await fs.writeFile(
      `deployments/${network.name}.json`,
      JSON.stringify(deployments, null, 2)
    );

    console.log(`saved new proxy to deployments/${network.name}.json`);
  });
