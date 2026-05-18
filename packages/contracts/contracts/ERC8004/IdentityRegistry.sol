// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract IdentityRegistry {
    struct AgentIdentity {
        address owner;
        string name;
        string agentType;
        string endpoint;
        uint256 createdAt;
        bool active;
    }

    mapping(bytes32 => AgentIdentity) public agents;

    event AgentRegistered(bytes32 indexed agentId, address indexed owner, string name, string agentType);
    event AgentStatusChanged(bytes32 indexed agentId, bool active);

    function registerAgent(
        string memory name,
        string memory agentType,
        string memory endpoint
    ) external returns (bytes32 agentId) {
        agentId = keccak256(abi.encodePacked(msg.sender, name, block.timestamp));
        agents[agentId] = AgentIdentity({
            owner: msg.sender,
            name: name,
            agentType: agentType,
            endpoint: endpoint,
            createdAt: block.timestamp,
            active: true
        });
        emit AgentRegistered(agentId, msg.sender, name, agentType);
    }

    function setAgentStatus(bytes32 agentId, bool status) external {
        require(agents[agentId].owner == msg.sender, "Not agent owner");
        agents[agentId].active = status;
        emit AgentStatusChanged(agentId, status);
    }
}
