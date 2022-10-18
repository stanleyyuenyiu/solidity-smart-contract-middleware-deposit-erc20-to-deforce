// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

/*
 * @title LibModifier Contract
 * @dev This contract is the include the events.
 *
 */
contract LibModifier {
    event Deposited(address indexed _user, uint256 indexed _amount, uint256 indexed fee);
}
