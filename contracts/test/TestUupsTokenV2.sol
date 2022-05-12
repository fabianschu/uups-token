//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@abacus-network/app/contracts/Router.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20CappedUpgradeable.sol";


contract TestUupsTokenV2 is ERC20CappedUpgradeable, UUPSUpgradeable, OwnableUpgradeable, Router {
    event DoNothing();

    function upgradeFunction(address abacusConnectionManager) reinitializer(2) onlyOwner public {
      __Router_initialize(abacusConnectionManager);
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}
    
    function _authorizeUpgrade(address) internal override onlyOwner {}

    function doNothing() public {
      emit DoNothing();
    }

    function mint(address account, uint256 amount) public {
      _mint(account, amount);
    }

    function _handle(
        uint32 _origin,
        bytes32,
        bytes memory _message
    ) internal override {

    }
}
