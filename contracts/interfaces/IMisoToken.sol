// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.8.0;

interface IMisoToken {
    function init(bytes calldata data) external payable;
    function initToken(bytes calldata data) external;
    function tokenTemplate() external view returns (uint256);
}
