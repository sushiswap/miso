pragma solidity 0.6.12;

// ----------------------------------------------------------------------------
// White List interface
// ----------------------------------------------------------------------------

interface IMerkleList {
    function points(address account, bytes calldata listData) external view returns (uint256);
    function isInList(address account, bytes calldata listData) external view returns (bool);
    function hasPoints(address account, uint256 amount, bytes calldata listData) external view  returns (bool);
    function setMerkleRoot(bytes32 _merkleRoot) external; 
    function initMerkleList(address accessControl) external;
}
