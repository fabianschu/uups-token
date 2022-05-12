const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("UupsToken", function () {
  const v1SupplyCap = 10 ** 9;
  const aliceShare = 10 ** 5;

  let deployer, alice, bob;
  let uupsToken;

  beforeEach("deploy UupsToken", async () => {
    [deployer, alice, bob] = await ethers.getSigners();
    const UupsToken = await ethers.getContractFactory("UupsToken");
    uupsToken = await upgrades.deployProxy(UupsToken, [bob.address], {
      kind: "uups",
    });
  });

  context("when the token has been deployed", () => {
    it("mints 1bn tokens to recipient", async () => {
      expect(await uupsToken.balanceOf(bob.address)).to.equal(v1SupplyCap);
    });

    it("sets 1bn as supply cap", async () => {
      expect(await uupsToken.cap()).to.equal(v1SupplyCap);
    });
  });

  context("when upgrading the token", () => {
    const v2SupplyCap = 2 * 10 ** 9;

    let uupsTokenV2;

    beforeEach("transfer some tokens from bob to alice", async () => {
      await uupsToken.connect(bob).transfer(alice.address, aliceShare);
    });

    beforeEach("upgrade the token contract", async () => {
      const UupsTokenV2 = await ethers.getContractFactory("UupsTokenV2");
      uupsTokenV2 = await upgrades.upgradeProxy(uupsToken.address, UupsTokenV2);
    });

    it("adds functions to implementation contract", async () => {
      await expect(uupsTokenV2.doNothing()).to.emit(uupsTokenV2, "DoNothing");
    });

    it("conserves the token balances", async () => {
      expect(await uupsToken.balanceOf(alice.address)).to.equal(aliceShare);
      expect(await uupsToken.balanceOf(bob.address)).to.equal(
        v1SupplyCap - aliceShare
      );
    });
  });

  context("with ownership transferred to alice", () => {
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

  context("with ownership renounced", () => {
    it("reverts if attempting to upgrade", async () => {
      expect(await uupsToken.owner()).to.equal(deployer.address);

      await uupsToken.renounceOwnership();

      const UupsTokenV2 = await ethers.getContractFactory("UupsTokenV2");

      await expect(
        upgrades.upgradeProxy(uupsToken.address, UupsTokenV2)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
