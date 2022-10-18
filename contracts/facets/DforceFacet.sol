// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

/*
 * @title DForce Facet Implementation Contract
 * @notice Implementation of depositing supported collateral types into DForce.
 *
 */
import '../lib/Modifier.sol';
import './DforceFacetStorage.sol';
import '../interfaces/IERC20.sol';
import '../interfaces/protocols/dforce/IiToken.sol';
import '../interfaces/protocols/dforce/IiEth.sol';
import '../interfaces/protocols/dforce/IControllerInterface.sol';
import "@openzeppelin/contracts/access/Ownable.sol";

contract DforceFacet is Ownable, LibModifier, DforceDataStorageContract {
 

  function getDforceFee() public view returns (uint256 fee) {
    DforceDataStorage storage ds = getDforceDataStorage();
    fee = ds.fee;
  }

  function setDforceFee(uint256 _fee) external onlyOwner {
    DforceDataStorage storage ds = getDforceDataStorage();
    ds.fee = _fee;
  }

  function setDforceComptrollerAddr(address _addr) external onlyOwner {
    DforceDataStorage storage ds = getDforceDataStorage();
    ds.comptrollerAddr = _addr;
  }

  function getDforceComptrollerAddr() public view returns (address comptrollerAddr) {
    DforceDataStorage storage ds = getDforceDataStorage();
    comptrollerAddr = ds.comptrollerAddr;
  }


  function depositDforceERC20(
    address _underlyingTokenAddr,
    address _bearerTokenAddr,
    uint256 _amount
  ) external returns (uint256 tokenAmount) {
    IControllerInterface comptroller = IControllerInterface(getDforceComptrollerAddr());
    require(comptroller.hasiToken(_bearerTokenAddr), 'Token is not listed on dforce');

    IiToken iToken = IiToken(_bearerTokenAddr);
    require(address(iToken.underlying()) == _underlyingTokenAddr, 'Underlying does not match');

    IERC20 underlying = IERC20(_underlyingTokenAddr);
    require(
      underlying.transferFrom(msg.sender, address(this), _amount),
      'Unable to transfer ERC20 Token'
    );

    uint256 fee = (_amount / 10000) * getDforceFee();
    uint256 balance = _amount - fee;
    uint256 currentBearerTokenAmount = iToken.balanceOf(msg.sender);

    //allow bearer token to spend the token onbehalf of owner
    require(underlying.approve(_bearerTokenAddr, balance) == true, 'Unable to approve token');
    //mint bearer token to current contract
    iToken.mint(msg.sender, balance);
    //latest balance - current balance = balance that need minted to user
    tokenAmount = iToken.balanceOf(msg.sender) - currentBearerTokenAmount;

    emit Deposited(msg.sender, tokenAmount, fee);
  }

  function depositDforceEth()
    external
    payable
    returns (uint256 tokenAmount)
  {
    IiETH iEth = IiETH(0x5ACD75f21659a59fFaB9AEBAf350351a8bfaAbc0);

    uint256 currentIEthBalance = iEth.balanceOf(msg.sender);

    uint256 fee = (msg.value / 10000) * (getDforceFee());
    uint256 balance = msg.value - fee;

    //mint bearer token to current contract
    iEth.mint{ value: balance }(msg.sender);
    //latest balance - current balance = balance that need to transfer to user
    tokenAmount = iEth.balanceOf(msg.sender) - currentIEthBalance;
    
    emit Deposited(msg.sender, tokenAmount, fee);
  }
}
