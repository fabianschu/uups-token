//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20CappedUpgradeable.sol";

contract UupsToken is ERC20CappedUpgradeable, UUPSUpgradeable, OwnableUpgradeable {

    uint256 constant supplyCap = 10**9;

    function initialize(address recipient) initializer public {
      __ERC20_init("UupsToken", "UUPS");
      __ERC20Capped_init(supplyCap);
      __Ownable_init(); 
      __UUPSUpgradeable_init();
      _mint(recipient, supplyCap);
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function mint(address account, uint256 amount) public onlyOwner {
      _mint(account, amount);
    }
}
