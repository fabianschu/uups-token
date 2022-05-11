//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

contract UupsToken is Initializable, ERC20Upgradeable, UUPSUpgradeable, OwnableUpgradeable {
    function initialize() initializer public {
      __ERC20_init("UupsToken", "UUPS");
      __Ownable_init(); 
      __UUPSUpgradeable_init();
      _mint(msg.sender, 1000 * 10 ** decimals());
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
