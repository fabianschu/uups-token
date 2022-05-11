const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("UupsToken", function () {
  let deployer;
  let uupsToken;

  beforeEach("deploy UupsToken", async () => {
    [deployer] = await ethers.getSigners();
    const UupsToken = await ethers.getContractFactory("UupsToken");
    uupsToken = await upgrades.deployProxy(UupsToken, { kind: "uups" });
  });

  context("when upgrading the token", () => {
    beforeEach("upgrade the token contract", async () => {
      const UupsTokenV2 = await ethers.getContractFactory("UupsTokenV2");
      uupsToken = await upgrades.upgradeProxy(uupsToken.address, UupsTokenV2);
    });

    it("the upgraded token contains newly added fn", async () => {
      await expect(uupsToken.doNothing()).to.emit(uupsToken, "DoNothing");
    });
  });
});
