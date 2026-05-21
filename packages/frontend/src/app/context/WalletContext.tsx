"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface WalletContextType {
  walletAddress: string;
  isCorrectNetwork: boolean;
  showInstallWarning: boolean;
  setShowInstallWarning: (val: boolean) => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(true);
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
          setShowInstallWarning(false);
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

  return (
    <WalletContext.Provider value={{
      walletAddress,
      isCorrectNetwork,
      showInstallWarning,
      setShowInstallWarning,
      connectWallet,
      disconnectWallet,
      switchNetwork
    }}>
      {children}
    </WalletContext.Provider>
  );
};
