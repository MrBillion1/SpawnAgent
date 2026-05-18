// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./AgentWallet.sol";
import "./ERC8004/IdentityRegistry.sol";

contract SpawnFactory {
    IdentityRegistry public identityRegistry;

    event AgentSpawned(address indexed owner, address wallet, bytes32 agentId);

    constructor(address _identityRegistry) {
        identityRegistry = IdentityRegistry(_identityRegistry);
    }

    function spawnAgent(
        string memory name,
        string memory agentType,
        string memory endpoint,
        uint256 maxSpendPerTx
    ) external returns (address, bytes32) {
        // Register the agent in the ERC-8004 Identity Registry
        bytes32 agentId = identityRegistry.registerAgent(name, agentType, endpoint);

        // Deploy the dedicated smart contract wallet for the agent
        AgentWallet wallet = new AgentWallet(msg.sender, agentId, maxSpendPerTx);

        emit AgentSpawned(msg.sender, address(wallet), agentId);

        return (address(wallet), agentId);
    }
}
