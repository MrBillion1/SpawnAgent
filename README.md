# Spawn Agent — Autonomous AI Agents on Mantle

> Hire an AI agent. Fund it with mETH. Watch it work.

**Spawn** is a consumer-facing dApp for the [Mantle Turing Test Hackathon 2026](https://mantle.xyz) that lets anyone create, fund, and deploy autonomous AI agents on the Mantle Network using plain English.

---

## Project Structure

```
spawn-monorepo/
├── packages/
│   ├── contracts/     # Hardhat — ERC-8004 Registries, AgentWallet, SpawnFactory, Mocks
│   ├── frontend/      # Next.js — Landing page, agent creation UI, dashboard
│   └── runtime/       # Node.js — AI config parser, agent execution loop, Telegram alerts
├── pnpm-workspace.yaml
└── package.json
```

## Features
- **Natural Language Agent Creation** — Describe your agent in plain English; Claude/Gemini/OpenRouter parses it into a strict JSON config.
- **ERC-8004 Identity Registry** — Each agent gets a permanent on-chain identity.
- **ERC-8004 Reputation Registry** — Every action is logged on-chain for full transparency.
- **AgentWallet** — A smart contract wallet per agent with spend limits, action whitelisting, and a pause switch.
- **SpawnFactory** — Deploys a wallet + registers the agent in a single transaction.
- **Multi-LLM Support** — Works with Google Gemini, Anthropic Claude, or any model via OpenRouter.
- **Telegram Alerts** — Instant notifications when your agent fires a trigger.
- **Mock DeFi Protocols** — Mock mETH, USDY, Agni Finance, and Merchant Moe for local testing.

## Mantle Network
- **Testnet RPC:** `https://rpc.sepolia.mantle.xyz` (Chain ID: 5003)
- **Mainnet RPC:** `https://rpc.mantle.xyz` (Chain ID: 5000)

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)

### Installation
```bash
pnpm install
```

### Configure Environment
```bash
cp packages/runtime/.env.example packages/runtime/.env
# Fill in your GEMINI_API_KEY and TELEGRAM_BOT_TOKEN
```

### Deploy Contracts (Local)
```bash
pnpm --filter @spawn/contracts run deploy:local
```

### Start the AI Agent Runtime
```bash
pnpm --filter @spawn/runtime run dev
```

### Start the Web UI
```bash
pnpm --filter @spawn/frontend run dev
```

## Smart Contract Deployment Order
1. `IdentityRegistry`
2. `ReputationRegistry`
3. `ValidationRegistry`
4. `SpawnFactory` (pass the `IdentityRegistry` address to the constructor)

## License
MIT
