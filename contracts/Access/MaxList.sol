pragma solidity 0.6.12;

/**
 * @dev Set an uint max amount for all addresses
 * @dev uint256 public maxPoints;
 * @dev This amount can be changed by an operator
 */

import "../OpenZeppelin/math/SafeMath.sol";
import "./MISOAccessControls.sol";
import "../interfaces/IPointList.sol";


contract MaxList is IPointList, MISOAccessControls {
    using SafeMath for uint;

    /// @notice Maximum amount of points for any address.
    uint256 public maxPoints;

    /// @notice Event emitted when points are updated.
    event PointsUpdated(uint256 oldPoints, uint256 newPoints);


    constructor() public {}

    /**
     * @notice Initializes point list with admin address.
     * @param _admin Admins address.
     */
    function initPointList(address _admin) public override {
        initAccessControls(_admin);
    }

    /**
     * @notice Returns the amount of points of any address.
     * @param _account Account address.
     * @return uint256 maxPoints.
     */
    function points(address _account) public view returns (uint256) {
        return maxPoints;
    }

    /**
     * @notice Returns the maximum amount of points.
     * @param _account Account address.
     * @return bool True or False.
     */
    function isInList(address _account) public view override returns (bool) {
        return true;
    }

    /**
     * @notice Checks if maxPoints is bigger or equal to the number given.
     * @param _account Account address.
     * @param _amount Desired amount of points.
     * @return bool True or False.
     */
    function hasPoints(address _account, uint256 _amount) public view override returns (bool) {
        return maxPoints >= _amount ;
    }

    /**
     * @notice Sets maxPoints.
     * @param _accounts An array of accounts. Kept for compatibility with IPointList
     * @param _amounts An array of corresponding amounts. Kept for compatibility with IPointList
     */
    function setPoints(address[] memory _accounts, uint256[] memory _amounts) external override {
        require(hasAdminRole(msg.sender) || hasOperatorRole(msg.sender), "MaxList.setPoints: Sender must be operator");
        require(_amounts.length == 1);
        maxPoints = _amounts[0];
        emit PointsUpdated(maxPoints, _amounts[0]);
    }
}