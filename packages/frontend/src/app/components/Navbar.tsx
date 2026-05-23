"use client";

import { useEffect, useRef, useState } from "react";
import { useWallet } from "../context/WalletContext";

const navLinks = [
  { label: "Agents", href: "#agents" },
  { label: "Create", href: "#create-agent" },
  { label: "Protocols", href: "#protocols" },
  { label: "Contract", href: "https://sepolia.mantlescan.xyz/address/0x061c4A04DAEdeB69374C9A96b120DA6ee3a6a71e", external: true },
];

const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

export default function Navbar() {
  const {
    walletAddress,
    chainName,
    isCorrectNetwork,
    isConnecting,
    showInstallWarning,
    errorMessage,
    setShowInstallWarning,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  } = useWallet();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeDropdown = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  return (
    <>
      {showInstallWarning ? (
        <div className="wallet-toast">
          <div className="toast-heading">
            <strong>Wallet Required</strong>
            <button type="button" onClick={() => setShowInstallWarning(false)} aria-label="Close wallet warning">
              x
            </button>
          </div>
          <p>Install MetaMask or another injected wallet to deploy Spawn agents on Mantle Sepolia.</p>
          <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
            Install MetaMask
          </a>
        </div>
      ) : null}

      {errorMessage ? <div className="wallet-error">{errorMessage}</div> : null}

      <nav className="navbar">
        <a className="brand" href="#top" aria-label="Spawn home">
          <span className="brand-mark">S</span>
          <span>SPAWN</span>
        </a>

        <div className="nav-links">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="wallet-actions">
          {walletAddress && !isCorrectNetwork ? (
            <button type="button" className="network-button" onClick={switchNetwork}>
              <span />
              Switch to Mantle
            </button>
          ) : null}

          {walletAddress ? (
            <div className="wallet-menu" ref={dropdownRef}>
              <button type="button" className="wallet-button connected" onClick={() => setShowDropdown((open) => !open)}>
                <span className={isCorrectNetwork ? "status-dot good" : "status-dot bad"} />
                {truncateAddress(walletAddress)}
                <span className="chevron">v</span>
              </button>

              {showDropdown ? (
                <div className="wallet-dropdown">
                  <div>
                    <span>Connected wallet</span>
                    <strong>{truncateAddress(walletAddress)}</strong>
                  </div>
                  <div>
                    <span>Network</span>
                    <strong className={isCorrectNetwork ? "network-good" : "network-bad"}>{chainName}</strong>
                  </div>
                  {!isCorrectNetwork ? (
                    <button type="button" className="dropdown-button" onClick={switchNetwork}>
                      Add or switch network
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="dropdown-button danger"
                    onClick={() => {
                      disconnectWallet();
                      setShowDropdown(false);
                    }}
                  >
                    Disconnect wallet
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <button type="button" className="wallet-button" onClick={connectWallet} disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
