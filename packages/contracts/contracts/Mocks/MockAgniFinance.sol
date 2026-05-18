// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockAgniFinance {
    uint256 public currentYield;

    constructor() {
        currentYield = 450; // 4.5% represented in basis points
    }

    function setYield(uint256 _yield) external {
        currentYield = _yield;
    }

    function getYieldRate() external view returns (uint256) {
        return currentYield;
    }
}
