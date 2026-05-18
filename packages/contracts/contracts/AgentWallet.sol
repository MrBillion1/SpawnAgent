// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AgentWallet {
    address public owner;
    bytes32 public agentId;
    mapping(address => bool) public actionWhitelist;
    uint256 public maxSpendPerTx;
    bool public paused;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier notPaused() {
        require(!paused, "Wallet paused");
        _;
    }

    constructor(address _owner, bytes32 _agentId, uint256 _maxSpendPerTx) {
        owner = _owner;
        agentId = _agentId;
        maxSpendPerTx = _maxSpendPerTx;
    }

    function setWhitelist(address target, bool allowed) external onlyOwner {
        actionWhitelist[target] = allowed;
    }

    function setMaxSpend(uint256 amount) external onlyOwner {
        maxSpendPerTx = amount;
    }

    function togglePause() external onlyOwner {
        paused = !paused;
    }

    function execute(
        address target,
        uint256 value,
        bytes memory data
    ) external onlyOwner notPaused returns (bytes memory) {
        require(actionWhitelist[target], "Target not whitelisted");
        if (value > 0) {
            require(value <= maxSpendPerTx, "Exceeds max spend");
        }
        
        (bool success, bytes memory result) = target.call{value: value}(data);
        require(success, "Execution failed");
        return result;
    }

    function executeERC20Transfer(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner notPaused {
        require(actionWhitelist[token] || actionWhitelist[to], "Not whitelisted");
        require(amount <= maxSpendPerTx, "Exceeds max spend");
        
        IERC20(token).transfer(to, amount);
    }
    
    // Allow wallet to receive ETH/MNT
    receive() external payable {}
}
