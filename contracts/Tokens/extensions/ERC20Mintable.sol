// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.8.0;

import "../ERC20.sol";
import "../../Utils/Ownable.sol";

/// @notice Mintable extension for ERC20.
abstract contract ERC20Mintable is ERC20, Ownable {
    /// @notice Mints token `amount` for `to`.
    /// @param amount Sum to mint.
    function mint(address to, uint256 amount) public virtual onlyOwner {
        _mint(to, amount);
    }
}
