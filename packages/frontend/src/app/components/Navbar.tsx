"use client";

import { useState, useEffect } from 'react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Navbar() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(true);

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
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          await checkNetwork(window.ethereum);
        }
      } catch (error: any) {
        console.error("Wallet connection failed:", error.message);
      }
    } else {
      alert("Please install MetaMask to interact with the Spawn platform!");
    }
  };

  const switchNetwork = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: MANTLE_SEPOLIA_CHAIN_ID }],
        });
        setIsCorrectNetwork(true);
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
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
    if (typeof window !== 'undefined' && window.ethereum) {
      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            checkNetwork(window.ethereum);
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

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const truncateAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }} className="gradient-text" onClick={() => window.location.reload()}>SPAWN</div>
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {walletAddress && !isCorrectNetwork && (
          <button 
            className="btn-primary" 
            style={{ backgroundColor: '#ef4444', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }} 
            onClick={switchNetwork}
          >
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#fff', animate: 'ping 1s infinite' }} />
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
  );
}
