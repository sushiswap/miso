pragma solidity 0.6.12;


contract xMiso is ERC20("xMiso", "xMISO"){
    using SafeMath for uint256;
    IERC20 public miso;

    constructor(IERC20 _miso) public {
        miso = _miso;
    }

    /// @notice enter Enter the xMiso Bar. Pay some MISOs. Earn some shares.
    function enter(uint256 _amount) public {
        uint256 totalMiso = miso.balanceOf(address(this));
        uint256 totalShares = totalSupply();
        if (totalShares == 0 || totalMiso == 0) {
            _mint(msg.sender, _amount);
        } else {
            uint256 what = _amount.mul(totalShares).div(totalMiso);
            _mint(msg.sender, what);
        }
        miso.transferFrom(msg.sender, address(this), _amount);
    }

    /// @notice leave  Leave the bar. Claim back your MISOs.
    function leave(uint256 _share) public {
        uint256 totalShares = totalSupply();
        uint256 what = _share.mul(miso.balanceOf(address(this))).div(totalShares);
        _burn(msg.sender, _share);
        miso.transfer(msg.sender, what);
    }
}
