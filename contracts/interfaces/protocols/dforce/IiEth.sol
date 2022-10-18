//SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./IInterestRateModelInterface.sol";
import "./IControllerInterface.sol";
import "../../IERC20.sol";

interface IiETH is IERC20 {
    function isSupported() external returns (bool);

    function isiToken() external returns (bool);

    //----------------------------------
    //********* User Interface *********
    //----------------------------------
    function mint(address recipient) external payable;

    function redeem(address from, uint256 redeemTokens) external;

    function redeemUnderlying(address from, uint256 redeemAmount) external;

    function borrow(uint256 borrowAmount) external;

    function repayBorrow() external payable;

    function repayBorrowBehalf(address borrower) external;

    function liquidateBorrow(
        address borrower,
        address _assetCollateral
    ) external payable;

    function seize(
        address _liquidator,
        address _borrower,
        uint256 _seizeTokens
    ) external;

    function updateInterest() external returns (bool);

    function controller() external view returns (address);

    function exchangeRateCurrent() external returns (uint256);

    function exchangeRateStored() external view returns (uint256);

    function totalBorrowsCurrent() external returns (uint256);

    function totalBorrows() external view returns (uint256);

    function borrowBalanceCurrent(address _user) external returns (uint256);

    function borrowBalanceStored(address _user) external view returns (uint256);

    function borrowIndex() external view returns (uint256);

    function borrowRatePerBlock() external view returns (uint256);

    function supplyRatePerBlock() external view returns (uint256);

    function getCash() external view returns (uint256);

    function underlying() external view returns (IERC20);
}
