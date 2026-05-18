import { sendTelegramAlert } from './telegramBot';

// Mock sleep function
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const checkTrigger = async (config: any) => {
  console.log(`[Agent] Checking trigger: ${config.trigger_type}`);
  // In real life, use viem to check Mantle RPC or external APIs.
  // Mock trigger firing 50% of the time for demo.
  return Math.random() > 0.5;
};

const executeAction = async (config: any, walletAddress: string) => {
  console.log(`[Agent] Executing action via wallet ${walletAddress}: ${config.action_type}`);
  // In real life, use viem to call AgentWallet.execute()
  return "success";
};

const logToReputationRegistry = async (agentId: string, actionType: string, result: string) => {
  console.log(`[Agent] Logging to Reputation Registry for agent ${agentId} - Action: ${actionType}, Result: ${result}`);
  // Real implementation: Call ReputationRegistry.logAction()
};

export const runAgent = async (agentConfig: any, agentWalletAddress: string, agentId: string) => {
  console.log(`Started agent loop for ${agentId}`);
  
  while (agentConfig.status === 'active') {
    try {
      const triggered = await checkTrigger(agentConfig);
      
      if (triggered) {
        const result = await executeAction(agentConfig, agentWalletAddress);
        await logToReputationRegistry(agentId, agentConfig.action_type, result);
        
        if (agentConfig.alert_channel === 'telegram') {
          const message = `[Spawn] Agent ${agentId} fired | Action: ${agentConfig.action_type} | Status: ${result}`;
          await sendTelegramAlert(agentConfig.telegramChatId, message);
        }
      }
    } catch (err: any) {
      console.error(`Agent ${agentId} Error:`, err.message);
    }
    
    // Parse frequency or use default 10 seconds for demo
    await sleep(10000); 
  }
};

export const startAgentLoops = (agents: any[]) => {
  for (const agent of agents) {
    // Run async without awaiting to let them run in parallel
    runAgent(agent.config, agent.walletAddress, agent.agentId);
  }
};
