import { Connection, PublicKey } from "@solana/web3.js";

export type PercSnapshot = {
  ts: number;
  mint: string;

  priceUsd: number | null;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  priceChange24hPct: number | null;

  pairUrl: string | null;
  dexId: string | null;

  supplyUi: string | null;
  decimals: number | null;
};

type DexPair = {
  priceUsd?: string;
  liquidity?: { usd?: number };
  volume?: { h24?: number };
  priceChange?: { h24?: number };
  url?: string;
  dexId?: string;
};

export async function fetchDexScreenerBestPair(mint: string): Promise<DexPair | null> {
  const url = `https://api.dexscreener.com/token-pairs/v1/solana/${mint}`;
  const res = await fetch(url, { headers: { "accept": "application/json" }, cache: "no-store" });
  if (!res.ok) return null;

  const pairs = (await res.json()) as DexPair[];
  if (!Array.isArray(pairs) || pairs.length === 0) return null;

  // Pick the “best” pair by highest liquidity USD.
  const best = [...pairs].sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
  return best ?? null;
}

export async function fetchTokenSupplyUi(mint: string, rpcUrl: string): Promise<{ supplyUi: string; decimals: number } | null> {
  const conn = new Connection(rpcUrl, "confirmed");
  const pk = new PublicKey(mint);
  const supply = await conn.getTokenSupply(pk);
  return { supplyUi: supply.value.uiAmountString ?? String(supply.value.amount), decimals: supply.value.decimals };
}
