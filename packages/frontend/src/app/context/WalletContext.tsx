"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<any>;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

interface WalletContextType {
  walletAddress: string;
  chainId: string;
  chainName: string;
  isCorrectNetwork: boolean;
  isConnecting: boolean;
  showInstallWarning: boolean;
  errorMessage: string;
  setShowInstallWarning: (val: boolean) => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
}

const MANTLE_SEPOLIA_CHAIN_ID = "0x138b";

const mantleSepoliaParams = {
  chainId: MANTLE_SEPOLIA_CHAIN_ID,
  chainName: "Mantle Sepolia",
  nativeCurrency: {
    name: "Mantle",
    symbol: "MNT",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.sepolia.mantle.xyz"],
  blockExplorerUrls: ["https://sepolia.mantlescan.xyz"],
};

const chainNames: Record<string, string> = {
  "0x1": "Ethereum",
  "0x89": "Polygon",
  "0xa": "Optimism",
  "0xa4b1": "Arbitrum",
  "0x1388": "Mantle",
  "0x138b": "Mantle Sepolia",
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [chainId, setChainId] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [showInstallWarning, setShowInstallWarning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const chainName = chainId ? chainNames[chainId] ?? `Chain ${parseInt(chainId, 16)}` : "Not connected";
  const isCorrectNetwork = chainId === MANTLE_SEPOLIA_CHAIN_ID;

  const getEthereum = () => (typeof window !== "undefined" ? window.ethereum : undefined);

  const syncChain = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) return;
    const detectedChainId = await ethereum.request({ method: "eth_chainId" });
    setChainId(detectedChainId);
  }, []);

  const connectWallet = useCallback(async () => {
    const ethereum = getEthereum();

    if (!ethereum) {
      setShowInstallWarning(true);
      setErrorMessage("No browser wallet was detected.");
      return;
    }

    setIsConnecting(true);
    setErrorMessage("");

    try {
      const [accounts, detectedChainId] = await Promise.all([
        ethereum.request({ method: "eth_requestAccounts" }) as Promise<string[]>,
        ethereum.request({ method: "eth_chainId" }) as Promise<string>,
      ]);

      setWalletAddress(accounts[0] ?? "");
      setChainId(detectedChainId);
      setShowInstallWarning(false);
    } catch (error: any) {
      setErrorMessage(error?.message ?? "Wallet connection failed.");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletAddress("");
    setErrorMessage("");
  }, []);

  const switchNetwork = useCallback(async () => {
    const ethereum = getEthereum();

    if (!ethereum) {
      setShowInstallWarning(true);
      return;
    }

    setErrorMessage("");

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MANTLE_SEPOLIA_CHAIN_ID }],
      });
      setChainId(MANTLE_SEPOLIA_CHAIN_ID);
    } catch (switchError: any) {
      if (switchError?.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [mantleSepoliaParams],
          });
          setChainId(MANTLE_SEPOLIA_CHAIN_ID);
          return;
        } catch (addError: any) {
          setErrorMessage(addError?.message ?? "Failed to add Mantle Sepolia.");
          return;
        }
      }

      setErrorMessage(switchError?.message ?? "Failed to switch to Mantle Sepolia.");
    }
  }, []);

  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    let cancelled = false;

    const syncWallet = async () => {
      try {
        const [accounts, detectedChainId] = await Promise.all([
          ethereum.request({ method: "eth_accounts" }) as Promise<string[]>,
          ethereum.request({ method: "eth_chainId" }) as Promise<string>,
        ]);

        if (cancelled) return;
        setWalletAddress(accounts[0] ?? "");
        setChainId(detectedChainId);
      } catch (error: any) {
        if (!cancelled) {
          setErrorMessage(error?.message ?? "Failed to detect wallet state.");
        }
      }
    };

    const handleAccountsChanged = (accounts: string[]) => {
      setWalletAddress(accounts[0] ?? "");
    };

    const handleChainChanged = (nextChainId: string) => {
      setChainId(nextChainId);
    };

    syncWallet();
    ethereum.on?.("accountsChanged", handleAccountsChanged);
    ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      cancelled = true;
      ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [syncChain]);

  const value = useMemo(
    () => ({
      walletAddress,
      chainId,
      chainName,
      isCorrectNetwork,
      isConnecting,
      showInstallWarning,
      errorMessage,
      setShowInstallWarning,
      connectWallet,
      disconnectWallet,
      switchNetwork,
    }),
    [
      walletAddress,
      chainId,
      chainName,
      isCorrectNetwork,
      isConnecting,
      showInstallWarning,
      errorMessage,
      connectWallet,
      disconnectWallet,
      switchNetwork,
    ],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
