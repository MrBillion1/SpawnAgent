// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ValidationRegistry {
    struct Attestation {
        address validator;
        bytes32 agentId;
        string metric;
        uint256 score;
        uint256 timestamp;
    }

    mapping(bytes32 => Attestation[]) public attestations;

    event AttestationLogged(address indexed validator, bytes32 indexed agentId, string metric, uint256 score);

    function logAttestation(
        bytes32 agentId,
        string memory metric,
        uint256 score
    ) external {
        attestations[agentId].push(Attestation({
            validator: msg.sender,
            agentId: agentId,
            metric: metric,
            score: score,
            timestamp: block.timestamp
        }));
        
        emit AttestationLogged(msg.sender, agentId, metric, score);
    }
}
