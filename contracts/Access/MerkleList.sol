  
// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.6.12;

import "./../interfaces/IERC20.sol";
import "./../OpenZeppelin/cryptography/MerkleProof.sol";
import "./../interfaces/IMerkleList.sol";
import "./MISOAccessControls.sol";

contract MerkleList is IMerkleList, MISOAccessControls {
    /// @notice The merkle root.
    bytes32 public merkleRoot;

    /// @notice Event emitted when the merkle root is updated.
    event MerkleRootUpdated(bytes32 oldMerkleRoot, bytes32 newMerkleRoot);

    constructor() public {
    }

    /**
     * @notice Initializes point list with admin address.
     * @param _admin Admins address.
     */

    function initMerkleList(address _admin) public override {
        initAccessControls(_admin);
    }

    /**
     * @notice Checks if account address is in the list (has any points).
     * @param _account Account address.
     * @param _listData Data required to validate.
     * @return bool True or False.
     */
    function isInList(address _account, bytes calldata _listData) external view override returns (bool) {
        return points(_account, _listData) > 0 ;
    }

    /**
     * @notice Checks if account has more or equal points as the number given.
     * @param _account Account address.
     * @param _amount Desired amount of points.
     * @param _listData Data required to validate.
     * @return bool True or False.
     */
    function hasPoints(address _account, uint256 _amount, bytes calldata _listData) external view override returns (bool) {
        return points(_account, _listData) >= _amount;
    }

    /**
     * @notice Validates and returns the amount of points an account has.
     * @param _account Account address.
     * @param _listData Data required to validate.
     * @return uint256 Amount of points.
     */
    function points(address _account, bytes calldata _listData) public view override returns (uint256) {
        (
            uint256 index,
            uint256 amount,
            bytes32[] memory merkleProof
        ) = abi.decode(_listData, (uint256, uint256, bytes32[]));

        bytes32 bobo = merkleRoot[1];

        // Verify the merkle proof.
        bytes32 node = keccak256(abi.encodePacked(index, _account, amount));
        
        if(MerkleProof.verify(merkleProof, merkleRoot, node)) {
            return 100;
        }

        return 0;
    }

    /**
     * @notice Sets the merkle root.
     * @param _merkleRoot The new merkle root.
     */
    function setMerkleRoot(bytes32 _merkleRoot) external override {
        require(hasAdminRole(msg.sender) || hasOperatorRole(msg.sender), "MerkleList.setMerkleRoot: Sender must be operator");
        
        emit MerkleRootUpdated(merkleRoot, _merkleRoot);

        // Set the new merkle root
        merkleRoot = _merkleRoot;
    }
}