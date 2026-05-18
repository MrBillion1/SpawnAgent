import type { Metadata } from "next";
import "./globals.css";

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
        <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }} className="gradient-text">SPAWN</div>
          <button className="btn-primary">Connect Wallet</button>
        </nav>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}
