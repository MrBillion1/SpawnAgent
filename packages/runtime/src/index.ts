import * as dotenv from 'dotenv';
import { startAgentLoops } from './agentLoop';
import { initTelegramBot } from './telegramBot';

dotenv.config();

async function main() {
  console.log("Starting Spawn Agent Runtime...");

  const provider = process.env.LLM_PROVIDER || 'claude';
  if (provider === 'claude' && !process.env.CLAUDE_API_KEY) {
    console.warn("WARNING: CLAUDE_API_KEY not found in .env");
  } else if (provider === 'gemini' && !process.env.GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY not found in .env");
  } else if (provider === 'openrouter' && !process.env.OPENROUTER_API_KEY) {
    console.warn("WARNING: OPENROUTER_API_KEY not found in .env");
  }

  if (process.env.TELEGRAM_BOT_TOKEN) {
    initTelegramBot();
  } else {
    console.warn("WARNING: TELEGRAM_BOT_TOKEN not found in .env");
  }

  // Mock initial agents to start looping
  const mockAgents = [
    {
      agentId: "0x123",
      walletAddress: "0xabc",
      config: {
        goal: "Check my mETH yield every day...",
        trigger_type: "price_threshold",
        trigger_value: 4,
        action_type: "move_funds",
        action_params: { protocol: "agni" },
        alert_channel: "telegram",
        frequency: "30s",
        agent_type: "yield_guardian",
        status: "active"
      }
    }
  ];

  startAgentLoops(mockAgents);
}

main().catch(console.error);
