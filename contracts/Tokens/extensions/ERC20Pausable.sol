// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.8.0;

import "../../Utils/Ownable.sol";

/// @notice Pausable extension for ERC20.
abstract contract ERC20Pausable is Ownable {
    event TogglePause(bool indexed paused);
    
    bool public paused;
    
    /// @notice Initialize pausing module.
    /// @param _paused If 'true', modified functions are paused.
    constructor(bool _paused) {
        paused = _paused;
        emit TogglePause(_paused);
    }
    
    /// @notice Function pausing modifier that conditions functions to be called when `paused` is not enabled.
    modifier notPaused() {
        require(!paused, "PAUSED");
        _;
    }
    
    /// @notice Toggle `paused` conditions on/off.
    /// @param _paused If 'true', modified functions are paused.
    function togglePause(bool _paused) external onlyOwner {
        paused = _paused;
        emit TogglePause(_paused);
    }
}
