"use client";

import { useState, useEffect } from 'react';

export default function Navbar() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(true);
  const [showInstallWarning, setShowInstallWarning] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

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
          setShowDropdown(false);
        }
      } catch (error: any) {
        console.error("Wallet connection failed:", error.message);
      }
    } else {
      setShowInstallWarning(true);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress("");
    setShowDropdown(false);
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
      
      ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            checkNetwork(ethereum);
          }
        });

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
          backgroundColor: '#ffffff',
          border: '1px solid #ef4444',
          borderRadius: '16px',
          padding: '1.25rem',
          zIndex: 10000,
          maxWidth: '350px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 'bold', color: '#ef4444', fontSize: '1.1rem' }}>MetaMask Required</span>
            <button 
              onClick={() => setShowInstallWarning(false)} 
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0 0 10px' }}
            >
              ×
            </button>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 1rem 0', lineHeight: '1.4' }}>
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

      <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(15, 23, 42, 0.08)' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '900', cursor: 'pointer', color: '#000000', letterSpacing: '-0.05em' }} onClick={() => window.location.reload()}>SPAWN</div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', position: 'relative' }}>
          {walletAddress && !isCorrectNetwork && (
            <button 
              className="btn-primary" 
              style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem' }} 
              onClick={switchNetwork}
            >
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#fff', animation: 'pulse 2s infinite' }} />
              Switch Network
            </button>
          )}
          
          {walletAddress ? (
            <div>
              <button 
                className="btn-primary" 
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ background: '#000000', color: '#ffffff', borderRadius: '9999px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  {truncateAddress(walletAddress)}
                  <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>▼</span>
                </div>
              </button>

              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.75rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  borderRadius: '16px',
                  padding: '1rem',
                  minWidth: '220px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  zIndex: 9999,
                  animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                  <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(15, 23, 42, 0.06)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Connected Wallet</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a' }}>{truncateAddress(walletAddress)}</span>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Network</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2563eb' }}>Mantle Sepolia</span>
                  </div>

                  <button 
                    onClick={disconnectWallet}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      backgroundColor: '#fee2e2',
                      color: '#ef4444',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fecaca';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fee2e2';
                    }}
                  >
                    Disconnect Wallet
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn-primary" onClick={connectWallet} style={{ background: '#000000', color: '#ffffff', borderRadius: '9999px' }}>
              Connect Wallet
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
