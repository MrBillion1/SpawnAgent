// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockMerchantMoe {
    IERC20 public usdy;
    IERC20 public meth;

    constructor(address _usdy, address _meth) {
        usdy = IERC20(_usdy);
        meth = IERC20(_meth);
    }

    // Mock swap USDY to mETH at 1:1 ratio for simplicity
    function swapUSDYForMETH(uint256 amountIn) external {
        require(usdy.transferFrom(msg.sender, address(this), amountIn), "USDY transfer failed");
        // Mint or transfer mETH back
        // For testing, assuming this contract has enough mETH balance
        require(meth.transfer(msg.sender, amountIn), "mETH transfer failed");
    }
}
