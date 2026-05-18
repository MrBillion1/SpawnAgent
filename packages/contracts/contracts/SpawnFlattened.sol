// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// ==========================================
// ERC-8004 Registries
// ==========================================

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

// ==========================================
// Agent Wallet & Factory
// ==========================================

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
    
    receive() external payable {}
}

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
        bytes32 agentId = identityRegistry.registerAgent(name, agentType, endpoint);
        AgentWallet wallet = new AgentWallet(msg.sender, agentId, maxSpendPerTx);
        emit AgentSpawned(msg.sender, address(wallet), agentId);
        return (address(wallet), agentId);
    }
}

// ==========================================
// Mock Protocols (For Testing)
// ==========================================

contract MockmETH is ERC20 {
    constructor() ERC20("Mock mETH", "mETH") {}
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract MockUSDY is ERC20 {
    constructor() ERC20("Mock USDY", "USDY") {}
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract MockAgniFinance {
    uint256 public currentYield;
    constructor() { currentYield = 450; }
    function setYield(uint256 _yield) external { currentYield = _yield; }
    function getYieldRate() external view returns (uint256) { return currentYield; }
}

contract MockMerchantMoe {
    IERC20 public usdy;
    IERC20 public meth;
    constructor(address _usdy, address _meth) {
        usdy = IERC20(_usdy);
        meth = IERC20(_meth);
    }
    function swapUSDYForMETH(uint256 amountIn) external {
        require(usdy.transferFrom(msg.sender, address(this), amountIn), "USDY transfer failed");
        require(meth.transfer(msg.sender, amountIn), "mETH transfer failed");
    }
}
