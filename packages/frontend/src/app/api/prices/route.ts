import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const COINGECKO_MARKETS_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h";

const fallbackCoins = [
  ["bitcoin", "btc", "Bitcoin", 67420, 2.34],
  ["ethereum", "eth", "Ethereum", 3512, 1.87],
  ["tether", "usdt", "Tether", 1, 0.01],
  ["binancecoin", "bnb", "BNB", 612, -0.45],
  ["solana", "sol", "Solana", 178, 3.21],
  ["usd-coin", "usdc", "USDC", 1, 0.02],
  ["xrp", "xrp", "XRP", 0.612, -1.23],
  ["dogecoin", "doge", "Dogecoin", 0.1634, 4.56],
  ["toncoin", "ton", "Toncoin", 6.82, -2.11],
  ["cardano", "ada", "Cardano", 0.482, 0.98],
  ["avalanche-2", "avax", "Avalanche", 38.4, 1.44],
  ["shiba-inu", "shib", "Shiba Inu", 0.0000248, 5.67],
  ["wrapped-bitcoin", "wbtc", "Wrapped Bitcoin", 67380, 2.29],
  ["chainlink", "link", "Chainlink", 18.42, 2.78],
  ["polkadot", "dot", "Polkadot", 8.14, -0.88],
  ["bitcoin-cash", "bch", "Bitcoin Cash", 486, 1.12],
  ["uniswap", "uni", "Uniswap", 11.24, -1.56],
  ["near", "near", "NEAR Protocol", 7.82, 3.45],
  ["litecoin", "ltc", "Litecoin", 92.4, 0.67],
  ["mantle", "mnt", "Mantle", 0.854, 1.23],
].map(([id, symbol, name, current_price, price_change_percentage_24h], index) => ({
  id,
  symbol,
  name,
  current_price,
  price_change_percentage_24h,
  market_cap_rank: index + 1,
  image: "",
}));

export async function GET() {
  try {
    const headers: Record<string, string> = { accept: "application/json" };

    if (process.env.COINGECKO_DEMO_API_KEY) {
      headers["x-cg-demo-api-key"] = process.env.COINGECKO_DEMO_API_KEY;
    }

    if (process.env.COINGECKO_PRO_API_KEY) {
      headers["x-cg-pro-api-key"] = process.env.COINGECKO_PRO_API_KEY;
    }

    const response = await fetch(COINGECKO_MARKETS_URL, {
      headers,
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      throw new Error(`CoinGecko returned ${response.status}`);
    }

    const coins = await response.json();

    return NextResponse.json({
      source: "coingecko",
      updatedAt: new Date().toISOString(),
      coins,
    });
  } catch {
    return NextResponse.json({
      source: "fallback",
      updatedAt: new Date().toISOString(),
      coins: fallbackCoins,
    });
  }
}
