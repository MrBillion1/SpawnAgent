// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDY is ERC20 {
    constructor() ERC20("Mock USDY", "USDY") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
