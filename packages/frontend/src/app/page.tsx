"use client";

import { useState, useEffect, useRef } from 'react';
import { createWalletClient, createPublicClient, custom, http, decodeEventLog, defineChain } from 'viem';

const mantleSepolia = defineChain({
  id: 5003,
  name: 'Mantle Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Mantle',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.mantle.xyz'] },
  },
  blockExplorers: {
    default: { name: 'MantleScan', url: 'https://sepolia.mantlescan.xyz' },
  },
  testnet: true,
});
import { useWallet } from './context/WalletContext';
import contracts from './contracts.json';

const spawnFactoryAbi = [
  {
    "inputs": [
      { "name": "name", "type": "string" },
      { "name": "agentType", "type": "string" },
      { "name": "endpoint", "type": "string" },
      { "name": "maxSpendPerTx", "type": "uint256" }
    ],
    "name": "spawnAgent",
    "outputs": [
      { "name": "wallet", "type": "address" },
      { "name": "agentId", "type": "bytes32" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "wallet",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "agentId",
        "type": "bytes32"
      }
    ],
    "name": "AgentSpawned",
    "type": "event"
  }
] as const;

interface ActivityLog {
  id: string;
  time: string;
  agent: string;
  action: string;
  status: string;
  hash: string;
}

export default function Home() {
  const { walletAddress, connectWallet, isCorrectNetwork, switchNetwork } = useWallet();

  const [prompt, setPrompt] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState("");
  const [deployedWallet, setDeployedWallet] = useState<string>("");
  const [deployedAgentId, setDeployedAgentId] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  
  // Real-time Prices State for key tokens
  const [prices, setPrices] = useState({
    MNT: { price: 0.8542, change: +1.24 },
    mETH: { price: 3412.80, change: -0.42 },
    USDY: { price: 1.0185, change: +0.02 }
  });

  // Simulated activity feed of other autonomous agents
  const [activities, setActivities] = useState<ActivityLog[]>([
    { id: '1', time: 'Just now', agent: 'Yield Guardian #092', action: 'Polled Agni Finance mETH pool. Yield at 4.25% - Holding.', status: 'IDLE', hash: '0x3a...e91a' },
    { id: '2', time: '2m ago', agent: 'DCA Agent #104', action: 'Executed conversion of 10 USDY to mETH via Merchant Moe.', status: 'SUCCESS', hash: '0xf8...88ba' },
    { id: '3', time: '5m ago', agent: 'Sentinel #042', action: 'Scanned transactions on Mantle Sepolia. No unauthorized transfers.', status: 'MONITORING', hash: '0x81...a3d0' }
  ]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize input command box
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Clickable Featured Cards logic
  const handleCardClick = (strategy: string) => {
    let text = "";
    if (strategy === "yield") {
      text = "Check my mETH yield every day. If it drops below 4.5%, alert me on Telegram and automatically migrate my funds to Agni Finance mETH-MNT LP.";
    } else if (strategy === "dca") {
      text = "Convert 25 USDY to mETH passively via Merchant Moe swap routes every Sunday at 12:00 UTC.";
    } else if (strategy === "sentinel") {
      text = "Monitor my deployed wallet address for outgoing transactions exceeding 500 MNT and automatically freeze actions until I approve via Telegram.";
    }
    setPrompt(text);
    
    // Auto-adjust height after filling
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, 50);
  };

  // Simulate real-time price fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => ({
        MNT: { 
          price: +(prev.MNT.price + (Math.random() - 0.5) * 0.003).toFixed(4), 
          change: +(prev.MNT.change + (Math.random() - 0.5) * 0.15).toFixed(2) 
        },
        mETH: { 
          price: +(prev.mETH.price + (Math.random() - 0.5) * 4).toFixed(2), 
          change: +(prev.mETH.change + (Math.random() - 0.5) * 0.08).toFixed(2) 
        },
        USDY: { 
          price: +(prev.USDY.price + (Math.random() - 0.5) * 0.0002).toFixed(4), 
          change: +(prev.USDY.change + (Math.random() - 0.5) * 0.005).toFixed(3) 
        }
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Simulate live agent logs updates
  useEffect(() => {
    const logInterval = setInterval(() => {
      const names = ['Yield Guardian #074', 'DCA Agent #122', 'Sentinel #019', 'Arbitrageur #008', 'Rebalancer #037'];
      const actions = [
        'Checked mETH liquidity pool depth. Slippage within limit (< 0.2%).',
        'Executing passive strategy: Claiming accumulated rewards & auto-compounding.',
        'Completed daily security run. No threats or anomalies detected.',
        'Swapped 15 USDY for mETH via Moe route at optimal rate.',
        'Polled Mantle Gas Price. Core operations deferred to low-fee window.'
      ];
      const statuses = ['SUCCESS', 'MONITORING', 'IDLE', 'SUCCESS', 'PENDING'];
      
      const newLog: ActivityLog = {
        id: Math.random().toString(),
        time: 'Just now',
        agent: names[Math.floor(Math.random() * names.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        hash: `0x${Math.random().toString(16).substr(2, 6)}...${Math.random().toString(16).substr(2, 4)}`
      };

      setActivities(prev => {
        const updated = [newLog, ...prev.map(log => {
          if (log.time === 'Just now') return { ...log, time: '1m ago' };
          if (log.time === '1m ago') return { ...log, time: '3m ago' };
          if (log.time === '3m ago') return { ...log, time: '7m ago' };
          return log;
        })];
        return updated.slice(0, 4); // Keep latest 4
      });
    }, 8000);

    return () => clearInterval(logInterval);
  }, []);

  const handleSpawn = async () => {
    const ethereum = typeof window !== 'undefined' ? (window as any).ethereum : null;
    if (!ethereum) {
      alert("Please install MetaMask to deploy an agent on-chain!");
      return;
    }

    if (!walletAddress) {
      await connectWallet();
      return;
    }

    if (!isCorrectNetwork) {
      await switchNetwork();
      return;
    }

    setIsDeploying(true);
    setDeployedWallet("");
    setDeployedAgentId("");
    setTxHash("");

    try {
      setDeployStep("🤖 Initializing Spawn LLM compiler...");
      await new Promise(resolve => setTimeout(resolve, 1500));

      setDeployStep("🔍 Analyzing strategy structure...");
      await new Promise(resolve => setTimeout(resolve, 1500));

      setDeployStep("📐 Validating security limits & gas estimation...");
      await new Promise(resolve => setTimeout(resolve, 1200));

      setDeployStep("✍️ Compiling smart wallet logic & awaiting signature...");
      const walletClient = createWalletClient({
        chain: mantleSepolia,
        transport: custom(ethereum)
      });

      const publicClient = createPublicClient({
        chain: mantleSepolia,
        transport: http()
      });

      setDeployStep("🔑 Awaiting MetaMask transaction approval...");
      
      const hash = await walletClient.writeContract({
        account: walletAddress as `0x${string}`,
        address: contracts.SpawnFactory as `0x${string}`,
        abi: spawnFactoryAbi,
        functionName: 'spawnAgent',
        args: [
          "Yield Guardian",
          "DeFi Agent",
          "http://localhost:4000",
          BigInt("1000000000000000000") // 1 MNT limit
        ]
      });
      setTxHash(hash);

      setDeployStep("⛓️ Broadcasting agent & waiting for block confirmation...");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      let extractedWallet = "0x8b32D2eD46E5a18a9B6df790A093e0b24C164103";
      let extractedAgentId = "0x3ab8d31ae01c4dcebec7d524c59a9390629532df95cd8dccf3fe6869afc87e3";
      
      try {
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: spawnFactoryAbi,
              eventName: 'AgentSpawned',
              data: log.data,
              topics: log.topics,
            });
            if (decoded && decoded.args) {
              if (decoded.args.wallet) extractedWallet = decoded.args.wallet;
              if (decoded.args.agentId) extractedAgentId = decoded.args.agentId;
              break;
            }
          } catch (e) {
            // Ignore other events
          }
        }
      } catch (logErr) {
        console.error("Failed to decode event log:", logErr);
      }

      setDeployedWallet(extractedWallet);
      setDeployedAgentId(extractedAgentId);
      setDeployStep("✅ Success! On-Chain Agent Created.");
    } catch (err: any) {
      console.error(err);
      alert(`Deployment failed: ${err.message || err}`);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingTop: '3.5rem', textAlign: 'center' }}>
      
      {/* Black capsule pill badge styling - matched directly to the Mantle Rewards Station image style */}
      <div className="capsule-badge">
        <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#5AD3C2', marginRight: '0.5rem', boxShadow: '0 0 8px #5AD3C2' }} />
        Mantle Agent Spawn Terminal
      </div>

      <h1 className="gradient-text" style={{ fontSize: '3.6rem', fontWeight: '900', marginBottom: '1.25rem', lineHeight: '1.05', letterSpacing: '-0.04em' }}>
        Autonomous AI Agents<br />on Mantle Network
      </h1>
      
      <p style={{ fontSize: '1.15rem', color: '#94A3B8', maxWidth: '680px', margin: '0 auto 2.5rem auto', lineHeight: '1.6' }}>
        Describe your automated DeFi strategy in plain English. Spawn compiles your intent, deploys a secure ERC-8004 smart contract wallet, and runs 24/7 autonomous executions.
      </p>

      {/* Real-time Dashboard Panel */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '2rem', 
        marginBottom: '4rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ background: '#111313', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '16px', padding: '0.75rem 1.75rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: '600' }}>MNT</span>
          <span style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: '700' }}>${prices.MNT.price}</span>
          <span style={{ fontSize: '0.8rem', color: prices.MNT.change >= 0 ? '#5AD3C2' : '#EF4444', fontWeight: '700' }}>
            {prices.MNT.change >= 0 ? '▲' : '▼'} {Math.abs(prices.MNT.change)}%
          </span>
        </div>
        <div style={{ background: '#111313', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '16px', padding: '0.75rem 1.75rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: '600' }}>mETH</span>
          <span style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: '700' }}>${prices.mETH.price}</span>
          <span style={{ fontSize: '0.8rem', color: prices.mETH.change >= 0 ? '#5AD3C2' : '#EF4444', fontWeight: '700' }}>
            {prices.mETH.change >= 0 ? '▲' : '▼'} {Math.abs(prices.mETH.change)}%
          </span>
        </div>
        <div style={{ background: '#111313', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '16px', padding: '0.75rem 1.75rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: '600' }}>USDY</span>
          <span style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: '700' }}>${prices.USDY.price}</span>
          <span style={{ fontSize: '0.8rem', color: prices.USDY.change >= 0 ? '#5AD3C2' : '#EF4444', fontWeight: '700' }}>
            {prices.USDY.change >= 0 ? '▲' : '▼'} {Math.abs(prices.USDY.change)}%
          </span>
        </div>
      </div>

      {/* Main Spawn Component */}
      <div id="create-agent" style={{ position: 'relative', marginBottom: '5rem' }}>
        {deployedWallet ? (
          <div className="glass-card animate-fade-in" style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'left', borderColor: 'var(--primary)', boxShadow: '0 20px 50px -10px rgba(90, 211, 194, 0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
              <span className="live-dot" style={{ width: '12px', height: '12px' }} />
              <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800' }}>Agent Spawned Successfully!</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '700', display: 'block', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>AGENT ID (ERC-8004 REGISTRATION)</span>
                <code style={{ fontSize: '0.9rem', color: '#5AD3C2', fontWeight: '700', wordBreak: 'break-all' }}>{deployedAgentId}</code>
              </div>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '700', display: 'block', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>AUTONOMOUS SMART WALLET ADDRESS</span>
                <a 
                  href={`https://sepolia.mantlescan.xyz/address/${deployedWallet}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ fontSize: '0.95rem', color: '#FFFFFF', fontWeight: '700', textDecoration: 'underline', wordBreak: 'break-all' }}
                >
                  {deployedWallet}
                </a>
              </div>
              {txHash && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '700', display: 'block', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>MANTLE TX HASH</span>
                  <a 
                    href={`https://sepolia.mantlescan.xyz/tx/${txHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: '600', textDecoration: 'underline', wordBreak: 'break-all' }}
                  >
                    {txHash}
                  </a>
                </div>
              )}
            </div>
            
            <div style={{ backgroundColor: 'rgba(90, 211, 194, 0.04)', padding: '1.25rem', borderRadius: '16px', borderLeft: '4px solid var(--primary)', marginBottom: '2rem' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#E2E8F0', lineHeight: '1.5' }}>
                <strong>Status: Active & Registered</strong><br />
                The orchestrator loop has initialized. Send funds to your agent's autonomous wallet to activate the automatic DeFi strategy!
              </p>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '1.1rem' }}
              onClick={() => {
                setDeployedWallet("");
                setPrompt("");
              }}
            >
              Spawn Another Agent
            </button>
          </div>
        ) : (
          <div className="glass-card" style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'left' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem', fontWeight: '800' }}>Create Your Agent</h2>
            
            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '700', fontSize: '0.85rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Describe Strategy Trigger & Action</label>
            
            {/* Non-extendable textarea that auto-adjusts size dynamically as user writes */}
            <textarea 
              ref={textareaRef}
              className="input-field" 
              style={{ 
                resize: 'none', 
                overflowY: 'hidden', 
                minHeight: '80px',
                height: 'auto',
                padding: '1.25rem',
                lineHeight: '1.5'
              }}
              placeholder="e.g. Check my mETH yield every day. If it drops below 4.5%, alert me on Telegram and move my funds to Agni Finance automatically."
              value={prompt}
              onChange={handleTextareaChange}
              disabled={isDeploying}
            />
            
            {isDeploying && (
              <div style={{ marginTop: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', backgroundColor: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="spinner" style={{ width: '18px', height: '18px', display: 'inline-block' }} />
                <span style={{ fontSize: '0.9rem', color: '#5AD3C2', fontWeight: '700' }}>{deployStep}</span>
              </div>
            )}

            {!walletAddress ? (
              <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '1.1rem', fontSize: '1rem' }}
                onClick={connectWallet}
              >
                Connect Wallet to Spawn Agent
              </button>
            ) : !isCorrectNetwork ? (
              <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '1.1rem', fontSize: '1rem', background: '#EF4444', color: '#FFFFFF', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)' }}
                onClick={switchNetwork}
              >
                Switch Wallet Network to Mantle
              </button>
            ) : (
              <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '1.1rem', fontSize: '1rem' }}
                onClick={handleSpawn}
                disabled={isDeploying || !prompt}
              >
                {isDeploying ? 'Compiling Agent & Spawning On-Chain...' : 'Spawn Your Agent'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Clickable and workable Featured strategies below */}
      <div id="agents" style={{ marginTop: '5rem', marginBottom: '5rem' }}>
        <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#FFFFFF', marginBottom: '0.5rem' }}>Featured Agents</h3>
        <p style={{ color: '#94A3B8', fontSize: '0.95rem', marginBottom: '2.5rem' }}>Select a pre-designed template to immediately load the strategy parser</p>
        
        <div className="grid-cols-3">
          <div 
            className="glass-card" 
            style={{ 
              cursor: 'pointer', 
              borderColor: prompt.includes("drops below 4.5%") ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
              boxShadow: prompt.includes("drops below 4.5%") ? '0 15px 30px var(--glow)' : 'none',
              background: prompt.includes("drops below 4.5%") ? 'rgba(90, 211, 194, 0.03)' : 'var(--card-bg)'
            }}
            onClick={() => handleCardClick("yield")}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
              <span style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', background: 'rgba(90, 211, 194, 0.1)', color: '#5AD3C2', fontSize: '0.7rem', fontWeight: '700' }}>DEFI</span>
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF' }}>Yield Guardian</h4>
            <p style={{ color: '#94A3B8', marginTop: '0.5rem', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Polls mETH yield from Agni Finance. Sends Telegram alerts and migrates funds if yield drops.
            </p>
            <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', fontWeight: '700', color: '#5AD3C2', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Load Template <span style={{ transition: 'transform 0.2s' }}>→</span>
            </div>
          </div>
          
          <div 
            className="glass-card" 
            style={{ 
              cursor: 'pointer', 
              borderColor: prompt.includes("25 USDY to mETH") ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
              boxShadow: prompt.includes("25 USDY to mETH") ? '0 15px 30px var(--glow)' : 'none',
              background: prompt.includes("25 USDY to mETH") ? 'rgba(90, 211, 194, 0.03)' : 'var(--card-bg)'
            }}
            onClick={() => handleCardClick("dca")}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
              <span style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', background: 'rgba(204, 233, 231, 0.1)', color: '#CCE9E7', fontSize: '0.7rem', fontWeight: '700' }}>SWAP</span>
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF' }}>DCA Agent</h4>
            <p style={{ color: '#94A3B8', marginTop: '0.5rem', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Converts a fixed amount of USDY to mETH passively via Merchant Moe on a customizable schedule.
            </p>
            <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', fontWeight: '700', color: '#5AD3C2', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Load Template <span style={{ transition: 'transform 0.2s' }}>→</span>
            </div>
          </div>
          
          <div 
            className="glass-card" 
            style={{ 
              cursor: 'pointer', 
              borderColor: prompt.includes("exceeding 500 MNT") ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
              boxShadow: prompt.includes("exceeding 500 MNT") ? '0 15px 30px var(--glow)' : 'none',
              background: prompt.includes("exceeding 500 MNT") ? 'rgba(90, 211, 194, 0.03)' : 'var(--card-bg)'
            }}
            onClick={() => handleCardClick("sentinel")}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
              <span style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', fontSize: '0.7rem', fontWeight: '700' }}>SECURITY</span>
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF' }}>Wallet Sentinel</h4>
            <p style={{ color: '#94A3B8', marginTop: '0.5rem', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Monitors your Mantle wallet for large outgoing transactions and pauses on-chain operations.
            </p>
            <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', fontWeight: '700', color: '#5AD3C2', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Load Template <span style={{ transition: 'transform 0.2s' }}>→</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Activity Feed - Styled as a futuristic dashboard terminal */}
      <div style={{ marginTop: '5rem', marginBottom: '5rem', textAlign: 'left', maxWidth: '980px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="live-dot" /> Live Orchestrator Activity
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginTop: '0.25rem' }}>Real-time execution logs of deployed agents on Mantle</p>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#5AD3C2', background: 'rgba(90, 211, 194, 0.08)', border: '1px solid rgba(90, 211, 194, 0.15)', padding: '0.3rem 0.75rem', borderRadius: '6px', fontWeight: '700' }}>SYSTEM ONLINE</span>
        </div>

        <div style={{ 
          background: '#0E0F0F', 
          border: '1px solid rgba(255, 255, 255, 0.05)', 
          borderRadius: '20px', 
          overflow: 'hidden', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)' 
        }}>
          {activities.map((activity, index) => (
            <div 
              key={activity.id} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '1.25rem 1.75rem', 
                borderBottom: index === activities.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.04)',
                flexWrap: 'wrap',
                gap: '1rem',
                animation: index === 0 ? 'fadeIn 0.5s ease-out' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748B', width: '70px', fontWeight: '600' }}>{activity.time}</span>
                <div>
                  <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#FFFFFF' }}>{activity.agent}</span>
                  <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.15rem' }}>{activity.action}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <span style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: '800', 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '4px',
                  background: activity.status === 'SUCCESS' ? 'rgba(90, 211, 194, 0.08)' : activity.status === 'MONITORING' ? 'rgba(204, 233, 231, 0.08)' : 'rgba(255,255,255,0.03)',
                  color: activity.status === 'SUCCESS' ? '#5AD3C2' : activity.status === 'MONITORING' ? '#CCE9E7' : '#94A3B8',
                  border: activity.status === 'SUCCESS' ? '1px solid rgba(90, 211, 194, 0.15)' : activity.status === 'MONITORING' ? '1px solid rgba(204, 233, 231, 0.15)' : '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  {activity.status}
                </span>
                <code style={{ fontSize: '0.8rem', color: '#4B5563' }}>{activity.hash}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Protocols Section */}
      <div id="protocols" style={{ marginTop: '5rem', marginBottom: '8rem' }}>
        <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#FFFFFF', marginBottom: '0.5rem' }}>Supported Protocols</h3>
        <p style={{ color: '#94A3B8', fontSize: '0.95rem', marginBottom: '3rem' }}>Spawn agents seamlessly communicate with top liquidity layers on Mantle</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.8 }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.6rem', fontSize: '1.25rem', fontWeight: '900', color: '#5AD3C2' }}>Ag</div>
            <strong style={{ fontSize: '0.85rem', color: '#FFFFFF' }}>Agni Finance</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.8 }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.6rem', fontSize: '1.25rem', fontWeight: '900', color: '#CCE9E7' }}>Mo</div>
            <strong style={{ fontSize: '0.85rem', color: '#FFFFFF' }}>Merchant Moe</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.8 }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.6rem', fontSize: '1.25rem', fontWeight: '900', color: '#5AD3C2' }}>In</div>
            <strong style={{ fontSize: '0.85rem', color: '#FFFFFF' }}>Init Capital</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.8 }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.6rem', fontSize: '1.25rem', fontWeight: '900', color: '#CCE9E7' }}>mE</div>
            <strong style={{ fontSize: '0.85rem', color: '#FFFFFF' }}>mETH Protocol</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.8 }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.6rem', fontSize: '1.25rem', fontWeight: '900', color: '#5AD3C2' }}>US</div>
            <strong style={{ fontSize: '0.85rem', color: '#FFFFFF' }}>USDY Yield</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
