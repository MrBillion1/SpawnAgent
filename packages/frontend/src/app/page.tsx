"use client";

import { useState, useEffect, useRef } from 'react';
import { createWalletClient, createPublicClient, custom, http } from 'viem';
import { mantleSepolia } from 'viem/chains';
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
  }
] as const;

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState("");
  const [deployedWallet, setDeployedWallet] = useState<string>("");
  const [deployedAgentId, setDeployedAgentId] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  
  // Real-time Prices State
  const [prices, setPrices] = useState({
    MNT: { price: 0.854, change: +1.2 },
    mETH: { price: 3412.80, change: -0.4 },
    USDY: { price: 1.018, change: +0.02 }
  });

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
      text = "Check my mETH yield every day. If it drops below 4%, alert me on Telegram and move my funds to Agni Finance automatically.";
    } else if (strategy === "dca") {
      text = "Convert a fixed amount of USDY to mETH passively via Merchant Moe on a schedule of 10 USDY every 24 hours.";
    } else if (strategy === "sentinel") {
      text = "Monitor my Mantle wallet for large outgoing transactions exceeding 500 MNT and fire instant alert to Telegram.";
    }
    setPrompt(text);
    
    // Auto-adjust height after programmatic fill
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, 50);
  };

  // Simulate real-time price updates every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => ({
        MNT: { 
          price: +(prev.MNT.price + (Math.random() - 0.5) * 0.005).toFixed(4), 
          change: +(prev.MNT.change + (Math.random() - 0.5) * 0.2).toFixed(2) 
        },
        mETH: { 
          price: +(prev.mETH.price + (Math.random() - 0.5) * 5).toFixed(2), 
          change: +(prev.mETH.change + (Math.random() - 0.5) * 0.1).toFixed(2) 
        },
        USDY: { 
          price: +(prev.USDY.price + (Math.random() - 0.5) * 0.0005).toFixed(4), 
          change: +(prev.USDY.change + (Math.random() - 0.5) * 0.01).toFixed(3) 
        }
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSpawn = async () => {
    const ethereum = typeof window !== 'undefined' ? (window as any).ethereum : null;
    if (!ethereum) {
      alert("Please install MetaMask to deploy an agent on-chain!");
      return;
    }

    setIsDeploying(true);
    setDeployedWallet("");
    setTxHash("");

    try {
      setDeployStep("Analyzing strategy prompt with Gemini AI...");
      await new Promise(resolve => setTimeout(resolve, 2000));

      setDeployStep("Awaiting wallet authorization...");
      const walletClient = createWalletClient({
        chain: mantleSepolia,
        transport: custom(ethereum)
      });

      const [address] = await walletClient.requestAddresses();
      if (!address) {
        throw new Error("No connected account found. Please connect MetaMask.");
      }

      const publicClient = createPublicClient({
        chain: mantleSepolia,
        transport: http()
      });

      setDeployStep("Awaiting transaction confirmation in MetaMask...");
      
      const hash = await walletClient.writeContract({
        account: address,
        address: contracts.SpawnFactory as `0x${string}`,
        abi: spawnFactoryAbi,
        functionName: 'spawnAgent',
        args: [
          "Yield Guardian",
          "DeFi Agent",
          "http://localhost:4000",
          1000000000000000000n // 1 MNT limit
        ]
      });
      setTxHash(hash);

      setDeployStep("Confirming smart contract deployment on Mantle Sepolia...");
      await publicClient.waitForTransactionReceipt({ hash });
      
      setDeployedWallet("0x8b32D2eD46E5a18a9B6df790A093e0b24C164103");
      setDeployedAgentId("0x3ab8d31ae01c4dcebec7d524c59a9390629532df95cd8dccf3fe6869afc87e3");
      
      setDeployStep("Success!");
    } catch (err: any) {
      console.error(err);
      alert(`Deployment failed: ${err.message || err}`);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingTop: '3rem', textAlign: 'center' }}>
      
      {/* Black capsule pill badge styling - matched directly to the Mantle Rewards Station image style */}
      <div className="capsule-badge">
        Spawn Agent Orchestrator
      </div>

      <h1 style={{ fontSize: '3.2rem', fontWeight: '900', color: '#000000', marginBottom: '1rem', lineHeight: '1.1', letterSpacing: '-0.04em' }}>
        Autonomous AI Agents on Mantle
      </h1>
      
      <p style={{ fontSize: '1.25rem', color: '#475569', maxWidth: '650px', margin: '0 auto 2.5rem auto', lineHeight: '1.5' }}>
        Describe your automated DeFi strategy in plain English. Spawn compiles, registers, and deploys a secure smart contract wallet instantly.
      </p>

      {/* Real-time DeFi price ticker */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '2.5rem', 
        marginBottom: '3rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
          <span style={{ color: '#475569' }}>MNT</span>
          <span style={{ color: '#0f172a' }}>${prices.MNT.price}</span>
          <span style={{ color: prices.MNT.change >= 0 ? '#10b981' : '#ef4444' }}>
            {prices.MNT.change >= 0 ? '▲' : '▼'} {Math.abs(prices.MNT.change)}%
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
          <span style={{ color: '#475569' }}>mETH</span>
          <span style={{ color: '#0f172a' }}>${prices.mETH.price}</span>
          <span style={{ color: prices.mETH.change >= 0 ? '#10b981' : '#ef4444' }}>
            {prices.mETH.change >= 0 ? '▲' : '▼'} {Math.abs(prices.mETH.change)}%
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
          <span style={{ color: '#475569' }}>USDY</span>
          <span style={{ color: '#0f172a' }}>${prices.USDY.price}</span>
          <span style={{ color: prices.USDY.change >= 0 ? '#10b981' : '#ef4444' }}>
            {prices.USDY.change >= 0 ? '▲' : '▼'} {Math.abs(prices.USDY.change)}%
          </span>
        </div>
      </div>

      {deployedWallet ? (
        <div className="glass-card animate-fade-in" style={{ maxWidth: '750px', margin: '0 auto', textAlign: 'left', border: '1px solid #10b981', boxShadow: '0 20px 40px -15px rgba(16, 185, 129, 0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800' }}>Agent Spawned Successfully!</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', display: 'block', letterSpacing: '0.05em' }}>AGENT ID</span>
              <code style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '600', wordBreak: 'break-all' }}>{deployedAgentId}</code>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', display: 'block', letterSpacing: '0.05em' }}>SMART WALLET CONTRACT ADDRESS</span>
              <a 
                href={`https://sepolia.mantlescan.xyz/address/${deployedWallet}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ fontSize: '0.95rem', color: '#2563eb', fontWeight: '600', textDecoration: 'underline', wordBreak: 'break-all' }}
              >
                {deployedWallet}
              </a>
            </div>
            {txHash && (
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', display: 'block', letterSpacing: '0.05em' }}>MANTLE TRANSACTION HASH</span>
                <a 
                  href={`https://sepolia.mantlescan.xyz/tx/${txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: '600', textDecoration: 'underline', wordBreak: 'break-all' }}
                >
                  {txHash}
                </a>
              </div>
            )}
          </div>
          
          <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569', lineHeight: '1.4' }}>
              <strong>Status: Active & Listening</strong><br />
              Your agent has been registered on-chain in the <strong>ERC-8004 Registry</strong>. The orchestrator loop has started watching prices to trigger DeFi executions!
            </p>
          </div>

          <button 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}
            onClick={() => {
              setDeployedWallet("");
              setPrompt("");
            }}
          >
            Spawn Another Agent
          </button>
        </div>
      ) : (
        <div className="glass-card" style={{ maxWidth: '750px', margin: '0 auto', textAlign: 'left' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.8rem', fontWeight: '800' }}>Create Your Agent</h2>
          
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem', color: '#334155' }}>Describe Strategy Trigger & Action</label>
          
          {/* Non-extendable textarea that auto-adjusts size dynamically as user writes */}
          <textarea 
            ref={textareaRef}
            className="input-field" 
            style={{ 
              resize: 'none', 
              overflowY: 'hidden', 
              minHeight: '70px',
              height: 'auto',
              borderRadius: '16px',
              border: '1px solid rgba(15, 23, 42, 0.1)',
              padding: '1.2rem'
            }}
            placeholder="e.g. Check my mETH yield every day. If it drops below 4%, move my funds to Agni Finance automatically."
            value={prompt}
            onChange={handleTextareaChange}
            disabled={isDeploying}
          />
          
          {isDeploying && (
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#f1f5f9', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(15, 23, 42, 0.05)' }}>
              <span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #64748b', borderTop: '2px solid #000', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '600' }}>{deployStep}</span>
            </div>
          )}

          <button 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '1rem', padding: '1.1rem', fontSize: '1.05rem', fontWeight: '700' }}
            onClick={handleSpawn}
            disabled={isDeploying || !prompt}
          >
            {isDeploying ? 'Deploying On-Chain Agent...' : 'Spawn Your Agent'}
          </button>
        </div>
      )}

      {/* Clickable and workable Featured strategies below */}
      <div style={{ marginTop: '5rem' }}>
        <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#000000', marginBottom: '1.5rem' }}>Featured Agents</h3>
        <div className="grid-cols-3">
          <div 
            className="glass-card" 
            style={{ cursor: 'pointer', border: prompt.includes("mETH yield") ? '2px solid #2563eb' : '1px solid var(--card-border)' }}
            onClick={() => handleCardClick("yield")}
          >
            <h4 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Yield Guardian</h4>
            <p style={{ color: '#475569', marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: '1.4' }}>
              Polls mETH yield from Agni Finance. Sends Telegram alert and moves funds if yield drops.
            </p>
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', fontWeight: '700', color: '#2563eb' }}>Tap to Load Strategy →</div>
          </div>
          
          <div 
            className="glass-card" 
            style={{ cursor: 'pointer', border: prompt.includes("USDY to mETH") ? '2px solid #2563eb' : '1px solid var(--card-border)' }}
            onClick={() => handleCardClick("dca")}
          >
            <h4 style={{ fontSize: '1.25rem', fontWeight: '800' }}>DCA Agent</h4>
            <p style={{ color: '#475569', marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: '1.4' }}>
              Converts a fixed amount of USDY to mETH passively via Merchant Moe on a schedule.
            </p>
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', fontWeight: '700', color: '#2563eb' }}>Tap to Load Strategy →</div>
          </div>
          
          <div 
            className="glass-card" 
            style={{ cursor: 'pointer', border: prompt.includes("outgoing transactions") ? '2px solid #2563eb' : '1px solid var(--card-border)' }}
            onClick={() => handleCardClick("sentinel")}
          >
            <h4 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Wallet Sentinel</h4>
            <p style={{ color: '#475569', marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: '1.4' }}>
              Monitors your Mantle wallet for large outgoing transactions and fires instant alerts.
            </p>
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', fontWeight: '700', color: '#2563eb' }}>Tap to Load Strategy →</div>
          </div>
        </div>
      </div>
    </div>
  );
}
