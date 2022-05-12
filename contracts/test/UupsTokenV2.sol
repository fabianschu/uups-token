//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@abacus-network/app/contracts/Router.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20CappedUpgradeable.sol";


contract UupsTokenV2 is ERC20CappedUpgradeable, UUPSUpgradeable, OwnableUpgradeable, Router {
    event DoNothing();
    
    function initialize() initializer public {
      __ERC20Capped_init(10 * 10**10);
      __Router_initialize(address(0));
      __ERC20_init("UupsToken", "UUPS");
      __Ownable_init(); 
      __UUPSUpgradeable_init();
      _mint(msg.sender, 1500);
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
