const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("UupsToken", function () {
  const v1SupplyCap = ethers.utils.parseEther((10 ** 9).toString());
  const aliceShare = ethers.utils.parseEther((10 ** 5).toString());

  let deployer, alice, bob, someSigner;
  let uupsToken;

  beforeEach("deploy UupsToken", async () => {
    [deployer, alice, bob, someSigner] = await ethers.getSigners();
    const UupsToken = await ethers.getContractFactory("UupsToken");
    uupsToken = await upgrades.deployProxy(
      UupsToken,
      [bob.address, v1SupplyCap],
      {
        kind: "uups",
      }
    );
  });

  context("when the token has been deployed", () => {
    it("mints 1bn tokens to recipient", async () => {
      expect(await uupsToken.balanceOf(bob.address)).to.equal(v1SupplyCap);
    });
  });

  context("when upgrading the token to v2", () => {
    let testUupsTokenV2;

    beforeEach("transfer some tokens from bob to alice", async () => {
      await uupsToken.connect(bob).transfer(alice.address, aliceShare);
    });

    beforeEach("upgrade the token contract", async () => {
      const TestUupsTokenV2 = await ethers.getContractFactory(
        "TestUupsTokenV2"
      );
      testUupsTokenV2 = await upgrades.upgradeProxy(
        uupsToken.address,
        TestUupsTokenV2,
        {
          call: { fn: "upgradeFunction", args: [someSigner.address] },
        }
      );
    });

    it("adds functions to implementation contract", async () => {
      await expect(testUupsTokenV2.doNothing()).to.emit(
        testUupsTokenV2,
        "DoNothing"
      );
    });

    it("conserves the token balances", async () => {
      expect(await testUupsTokenV2.balanceOf(alice.address)).to.equal(
        aliceShare
      );
      expect(await testUupsTokenV2.balanceOf(bob.address)).to.equal(
        v1SupplyCap.sub(aliceShare)
      );
    });

    it("initializes the correct abacusConnectionManager", async () => {
      expect(await testUupsTokenV2.abacusConnectionManager()).to.equal(
        someSigner.address
      );
    });

    it("increases the supply cap", async () => {
      expect(await testUupsTokenV2.cap()).to.equal(ethers.constants.MaxUint256);
    });
  });

  context("with ownership transferred to alice", () => {
    beforeEach("transfer proxy admin ownership to alice", async () => {
      await uupsToken.transferOwnership(alice.address);
    });

    context("when original deployer tries to upgrade", () => {
      it("reverts 'Ownable: caller is not the owner'", async () => {
        const TestUupsTokenV2 = await ethers.getContractFactory(
          "TestUupsTokenV2"
        );

        await expect(
          upgrades.upgradeProxy(uupsToken.address, TestUupsTokenV2)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    context("when alice tries to upgrade", () => {
      it("upgrades the implementation", async () => {
        const TestUupsTokenV2 = await ethers.getContractFactory(
          "TestUupsTokenV2",
          alice
        );

        const testUupsTokenV2 = await upgrades.upgradeProxy(
          uupsToken.address,
          TestUupsTokenV2
        );

        await expect(testUupsTokenV2.doNothing()).to.emit(
          testUupsTokenV2,
          "DoNothing"
        );
      });
    });
  });

  context("with ownership renounced", () => {
    it("reverts if attempting to upgrade", async () => {
      expect(await uupsToken.owner()).to.equal(deployer.address);

      await uupsToken.renounceOwnership();

      const TestUupsTokenV2 = await ethers.getContractFactory(
        "TestUupsTokenV2"
      );

      await expect(
        upgrades.upgradeProxy(uupsToken.address, TestUupsTokenV2)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
