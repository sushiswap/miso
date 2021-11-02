// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.8.0;

import "./ERC20.sol";
import "../interfaces/IMisoToken.sol";

// ---------------------------------------------------------------------
// From the MISO Token Factory
//
// Made for Sushi.com 
// 
// Enjoy. (c) Chef Gonpachi 2021 
// <https://github.com/chefgonpachi/MISO/>
// ---------------------------------------------------------------------

contract FixedToken is ERC20, IMisoToken {
    /// @notice Miso template id for the token factory.
    /// @dev For different token types, this must be incremented.
    uint256 public constant override tokenTemplate = 1;
    
    /// @dev First set the token variables. This can only be done once.
    function initToken(
        string memory _name, 
        string memory _symbol, 
        address _owner, 
        uint256 _initialSupply
    ) public {
        initERC20(_name, _symbol);
        _mint(_owner, _initialSupply);
    }
    
    function init(bytes calldata _data) external override payable {}

    function initToken(bytes calldata _data) external override {
        (
            string memory _name,
            string memory _symbol,
            address _owner,
            uint256 _initialSupply
        ) = abi.decode(_data, (string, string, address, uint256));

        initToken(_name, _symbol, _owner, _initialSupply);
    }

    function getInitData(
        string calldata _name,
        string calldata _symbol,
        address _owner,
        uint256 _initialSupply
    )
        external
        pure
        returns (bytes memory _data)
    {
        _data = abi.encode(_name, _symbol, _owner, _initialSupply);
    }
}
