"use client";

import { useState, useEffect } from 'react';

export default function Navbar() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(true);
  const [hasMetaMask, setHasMetaMask] = useState<boolean>(false);
  const [showInstallWarning, setShowInstallWarning] = useState<boolean>(false);

  const MANTLE_SEPOLIA_CHAIN_ID = "0x138b"; // Chain ID 5003 in hex

  const checkNetwork = async (ethereum: any) => {
    try {
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      setIsCorrectNetwork(chainId === MANTLE_SEPOLIA_CHAIN_ID);
    } catch (err) {
      console.error("Failed to check network:", err);
    }
  };

  const connectWallet = async () => {
    const ethereum = typeof window !== 'undefined' ? (window as any).ethereum : null;
    
    if (ethereum) {
      try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          await checkNetwork(ethereum);
        }
      } catch (error: any) {
        console.error("Wallet connection failed:", error.message);
      }
    } else {
      setShowInstallWarning(true);
    }
  };

  const switchNetwork = async () => {
    const ethereum = typeof window !== 'undefined' ? (window as any).ethereum : null;
    
    if (ethereum) {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: MANTLE_SEPOLIA_CHAIN_ID }],
        });
        setIsCorrectNetwork(true);
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: MANTLE_SEPOLIA_CHAIN_ID,
                  chainName: 'Mantle Sepolia',
                  nativeCurrency: {
                    name: 'Mantle',
                    symbol: 'MNT',
                    decimals: 18,
                  },
                  rpcUrls: ['https://rpc.sepolia.mantle.xyz'],
                  blockExplorerUrls: ['https://sepolia.mantlescan.xyz'],
                },
              ],
            });
            setIsCorrectNetwork(true);
          } catch (addError) {
            console.error("Failed to add network:", addError);
          }
        }
        console.error("Failed to switch network:", switchError);
      }
    }
  };

  useEffect(() => {
    const ethereum = typeof window !== 'undefined' ? (window as any).ethereum : null;
    
    if (ethereum) {
      setHasMetaMask(true);
      
      // Check if already connected
      ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            checkNetwork(ethereum);
          }
        });

      // Event listeners
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress("");
        }
      };

      const handleChainChanged = (chainId: string) => {
        setIsCorrectNetwork(chainId === MANTLE_SEPOLIA_CHAIN_ID);
      };

      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    } else {
      setHasMetaMask(false);
    }
  }, []);

  const truncateAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <>
      {showInstallWarning && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#1f1f2e',
          border: '1px solid #ef4444',
          borderRadius: '12px',
          padding: '1.25rem',
          zIndex: 10000,
          maxWidth: '350px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
          animation: 'fade-in 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 'bold', color: '#ef4444', fontSize: '1.1rem' }}>MetaMask Required</span>
            <button 
              onClick={() => setShowInstallWarning(false)} 
              style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0 0 10px' }}
            >
              ×
            </button>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#a1a1aa', margin: '0 0 1rem 0', lineHeight: '1.4' }}>
            Please install the MetaMask extension in your browser to interact with the Spawn on-chain registry.
          </p>
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ display: 'block', textAlign: 'center', padding: '0.6rem', fontSize: '0.9rem', textDecoration: 'none' }}
          >
            Install MetaMask
          </a>
        </div>
      )}

      <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }} className="gradient-text" onClick={() => window.location.reload()}>SPAWN</div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {walletAddress && !isCorrectNetwork && (
            <button 
              className="btn-primary" 
              style={{ backgroundColor: '#ef4444', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }} 
              onClick={switchNetwork}
            >
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#fff', animation: 'pulse 2s infinite' }} />
              Switch to Mantle Sepolia
            </button>
          )}
          
          <button className="btn-primary" onClick={connectWallet}>
            {walletAddress ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                {truncateAddress(walletAddress)}
              </div>
            ) : (
              "Connect Wallet"
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
