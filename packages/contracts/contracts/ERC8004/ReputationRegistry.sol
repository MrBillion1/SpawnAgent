// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ReputationRegistry {
    struct ReputationEvent {
        bytes32 agentId;
        string actionType;
        string outcome;
        uint256 value;
        uint256 timestamp;
    }

    mapping(bytes32 => ReputationEvent[]) public agentHistory;

    event ReputationLogged(bytes32 indexed agentId, string actionType, string outcome, uint256 value);

    function logAction(
        bytes32 agentId,
        string memory actionType,
        string memory outcome,
        uint256 value
    ) external {
        // In a full implementation, we'd verify that msg.sender is authorized to log for this agent.
        // For MVP, anyone can log to demonstrate the functionality.
        agentHistory[agentId].push(ReputationEvent({
            agentId: agentId,
            actionType: actionType,
            outcome: outcome,
            value: value,
            timestamp: block.timestamp
        }));
        
        emit ReputationLogged(agentId, actionType, outcome, value);
    }

    function getHistory(bytes32 agentId) external view returns (ReputationEvent[] memory) {
        return agentHistory[agentId];
    }
}
