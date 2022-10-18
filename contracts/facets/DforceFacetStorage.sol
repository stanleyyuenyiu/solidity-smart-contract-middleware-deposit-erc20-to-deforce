//SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

/*
 * @title Dforce Facet Implementation Storage Contract
 * @dev This contract is the unstructured storage contract to store implementation specific data.
 *
 */

contract DforceDataStorageContract {
    bytes32 constant DFORCE_STORAGE_POSITION = keccak256("diamond.standard.dforce.storage");

    struct DforceDataStorage {
        //maps underlying collateral to bearer token addr
        address comptrollerAddr;
        uint256 fee;
        bool isPaused;
    }

    function getDforceDataStorage() internal pure returns (DforceDataStorage storage cds) {
        bytes32 position = DFORCE_STORAGE_POSITION;
        assembly {
            cds.slot := position
        }
    }
}

