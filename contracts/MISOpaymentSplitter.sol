// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity >=0.8.4;

import 'https://github.com/kalidao/kali-contracts/blob/main/contracts/libraries/SafeTransferLib.sol';

contract MISOpaymentSplitter {
    using SafeTransferLib for address;

    string public name;

    address[] public recipients;

    function init(string calldata name_, address[] calldata accounts) public {
        // cannot realistically overflow on human timescales
        unchecked {
            for (uint256 i; i < recipients.length; i++) {
                recipients.push(accounts[i]);
            }
        }
        name = name_;
    }

    function makePayment(address asset, uint256 amount) public payable {
        uint256 length = recipients.length; // saves MLOAD

        // cannot realistically overflow on human timescales
        unchecked {
            for (uint256 i; i < length; i++) {
                // if ETH value is attached, we interpret as ETH payment
                if (msg.value != 0) {
                    uint256 sum = msg.value / length;
                    recipients[i]._safeTransferETH(sum);
                } else {
                    uint256 sum = amount / length;
                    asset._safeTransferFrom(msg.sender, recipients[i], sum);
                }
            }
        }
    }
}

contract MISOpaymentSplitterCloneFactory {
    event SplitterDeployed(string name, address[] accounts);

    error NullDeploy();

    address payable private immutable masterSplitter;

    constructor(address payable masterSplitter_) {
        masterSplitter = masterSplitter_;
    }
    
    function deployMISOpaymentSplitter(
        string calldata name_,
        address[] calldata accounts_
    ) public payable returns (MISOpaymentSplitter misoPaymentSplitter) {
        misoPaymentSplitter = MISOpaymentSplitter(_cloneAsMinimalProxy(masterSplitter, name_));
        
        misoPaymentSplitter.init(name_, accounts_);

        emit SplitterDeployed(name_, accounts_);
    }

    /// @dev modified from Aelin (https://github.com/AelinXYZ/aelin/blob/main/contracts/MinimalProxyFactory.sol)
    function _cloneAsMinimalProxy(address payable base, string memory name_) internal virtual returns (address payable clone) {
        bytes memory createData = abi.encodePacked(
            // constructor
            bytes10(0x3d602d80600a3d3981f3),
            // proxy code
            bytes10(0x363d3d373d3d3d363d73),
            base,
            bytes15(0x5af43d82803e903d91602b57fd5bf3)
        );

        bytes32 salt = keccak256(bytes(name_));

        assembly {
            clone := create2(
                0, // no value
                add(createData, 0x20), // data
                mload(createData),
                salt
            )
        }
        // if CREATE2 fails for some reason, address(0) is returned
        if (clone == address(0)) revert NullDeploy();
    }
}
