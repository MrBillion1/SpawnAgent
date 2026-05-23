"use client";

import { useEffect, useMemo, useState } from "react";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  market_cap_rank?: number;
}

const formatPrice = (price: number) => {
  if (price >= 1000) return `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (price >= 0.001) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(8)}`;
};

export default function PriceTicker() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [source, setSource] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    const fetchPrices = async () => {
      try {
        const response = await fetch("/api/prices", { cache: "no-store" });
        const payload = await response.json();

        if (!cancelled && Array.isArray(payload.coins)) {
          setCoins(payload.coins.slice(0, 50));
          setSource(payload.source ?? "coingecko");
        }
      } catch {
        if (!cancelled) {
          setSource("offline");
        }
      }
    };

    fetchPrices();
    const interval = window.setInterval(fetchPrices, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const tickerCoins = useMemo(() => [...coins, ...coins], [coins]);

  return (
    <section className="price-ticker" aria-label="Live top 50 crypto prices">
      <div className="ticker-label">
        <span className="live-dot" />
        Top 50 Live Prices
        <span>{source === "coingecko" ? "CoinGecko" : source}</span>
      </div>
      <div className="ticker-window">
        <div className="ticker-track">
          {tickerCoins.length ? (
            tickerCoins.map((coin, index) => {
              const change = coin.price_change_percentage_24h ?? 0;
              const isUp = change >= 0;

              return (
                <div className="ticker-item" key={`${coin.id}-${index}`}>
                  <span className="ticker-rank">#{coin.market_cap_rank ?? (index % 50) + 1}</span>
                  {coin.image ? <img src={coin.image} alt="" className="ticker-logo" /> : null}
                  <strong>{coin.symbol.toUpperCase()}</strong>
                  <span>{formatPrice(coin.current_price)}</span>
                  <em className={isUp ? "price-up" : "price-down"}>
                    {isUp ? "+" : "-"}
                    {Math.abs(change).toFixed(2)}%
                  </em>
                </div>
              );
            })
          ) : (
            <div className="ticker-item">Loading market stream...</div>
          )}
        </div>
      </div>
    </section>
  );
}
