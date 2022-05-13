//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20CappedUpgradeable.sol";

contract UupsToken is ERC20Upgradeable, UUPSUpgradeable, OwnableUpgradeable {

    function initialize(address recipient, uint256 mintAmount) initializer public {
      __ERC20_init("UupsToken", "UUPS");
      __Ownable_init(); 
      __UUPSUpgradeable_init();

      _mint(recipient, mintAmount);
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function mint(address account, uint256 amount) public onlyOwner {
      _mint(account, amount);
    }
}
