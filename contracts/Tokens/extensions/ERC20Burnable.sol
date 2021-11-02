// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.8.0;

import "../ERC20.sol";

/// @notice Burnable extension for ERC20.
abstract contract ERC20Burnable is ERC20 {
    /// @notice Burns token `amount` from `msg.sender`.
    /// @param amount Sum to burn.
    function burn(uint256 amount) public virtual {
        _burn(msg.sender, amount);
    }
}
