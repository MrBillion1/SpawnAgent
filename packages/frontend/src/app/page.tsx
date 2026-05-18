"use client";

import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);

  const handleSpawn = () => {
    setIsDeploying(true);
    // Mock deployment delay
    setTimeout(() => {
      setIsDeploying(false);
      alert("Agent spawned successfully! Check your dashboard.");
    }, 2000);
  };

  return (
    <div className="animate-fade-in" style={{ paddingTop: '4rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
        <span className="gradient-text">Hire an AI Agent.</span><br />
        Fund it with mETH. Watch it work.
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#a1a1aa', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
        Managing DeFi positions manually is impossible. Describe your agent in plain English, and Spawn deploys it securely on Mantle.
      </p>

      <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Create Your Agent</h2>
        
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Agent Instruction</label>
        <textarea 
          className="input-field" 
          rows={4}
          placeholder="e.g. Check my mETH yield every day. If it drops below 4%, alert me on Telegram and move my funds to Agni Finance automatically."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        
        <button 
          className="btn-primary" 
          style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}
          onClick={handleSpawn}
          disabled={isDeploying || !prompt}
        >
          {isDeploying ? 'Parsing with AI & Deploying...' : 'Spawn Your Agent'}
        </button>
      </div>

      <div style={{ marginTop: '5rem' }}>
        <h3 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Featured Agents</h3>
        <div className="grid-cols-3">
          <div className="glass-card">
            <h4>Yield Guardian</h4>
            <p style={{ color: '#a1a1aa', marginTop: '0.5rem', fontSize: '0.9rem' }}>Polls mETH yield from Agni Finance. Sends Telegram alert and moves funds if yield drops.</p>
          </div>
          <div className="glass-card">
            <h4>DCA Agent</h4>
            <p style={{ color: '#a1a1aa', marginTop: '0.5rem', fontSize: '0.9rem' }}>Converts a fixed amount of USDY to mETH passively via Merchant Moe on a schedule.</p>
          </div>
          <div className="glass-card">
            <h4>Wallet Sentinel</h4>
            <p style={{ color: '#a1a1aa', marginTop: '0.5rem', fontSize: '0.9rem' }}>Monitors your Mantle wallet for large outgoing transactions and fires instant alerts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
