import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import PriceTicker from "./components/PriceTicker";
import { WalletProvider } from "./context/WalletContext";

export const metadata: Metadata = {
  title: "Spawn | Autonomous AI Agents on Mantle",
  description: "Hire an AI agent. Fund it with mETH. Watch it work. Spawn is the consumer entry point to Mantle's DeFi ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <WalletProvider>
          <Navbar />
          <PriceTicker />
          <main className="container">
            {children}
          </main>
        </WalletProvider>
      </body>
    </html>
  );
}

