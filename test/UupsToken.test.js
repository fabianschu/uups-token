const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("UupsToken", function () {
  let deployer, alice;
  let uupsToken;

  beforeEach("deploy UupsToken", async () => {
    [deployer, alice] = await ethers.getSigners();
    const UupsToken = await ethers.getContractFactory("UupsToken");
    uupsToken = await upgrades.deployProxy(UupsToken, { kind: "uups" });
  });

  context("when upgrading the token", () => {
    let uupsTokenV2;

    beforeEach("upgrade the token contract", async () => {
      const UupsTokenV2 = await ethers.getContractFactory("UupsTokenV2");
      uupsTokenV2 = await upgrades.upgradeProxy(uupsToken.address, UupsTokenV2);
    });

    it("the upgraded token contains newly added fn", async () => {
      await expect(uupsTokenV2.doNothing()).to.emit(uupsTokenV2, "DoNothing");
    });
  });

  context("with proxy admin ownership transferred to alice", () => {
    beforeEach("transfer proxy admin ownership to alice", async () => {
      await uupsToken.transferOwnership(alice.address);
    });

    context("when original deployer tries to upgrade", () => {
      it("reverts 'Ownable: caller is not the owner'", async () => {
        const UupsTokenV2 = await ethers.getContractFactory("UupsTokenV2");

        await expect(
          upgrades.upgradeProxy(uupsToken.address, UupsTokenV2)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    context("when alice tries to upgrade", () => {
      it("upgrades the implementation", async () => {
        const UupsTokenV2 = await ethers.getContractFactory(
          "UupsTokenV2",
          alice
        );

        const uupsTokenV2 = await upgrades.upgradeProxy(
          uupsToken.address,
          UupsTokenV2
        );

        await expect(uupsTokenV2.doNothing()).to.emit(uupsTokenV2, "DoNothing");
      });
    });
  });
});
