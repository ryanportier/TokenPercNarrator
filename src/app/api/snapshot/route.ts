import { NextResponse } from "next/server";
import { fetchDexScreenerBestPair, fetchTokenSupplyUi, PercSnapshot } from "@/lib/perc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RunnerResp =
  | { ok: true; ts?: number; market?: string; data?: any; cached?: boolean }
  | { ok: false; error: string; detail?: string };

async function tryRunnerSnapshot(mint: string) {
  const base = (process.env.PERCOLATOR_API_URL || "").trim();
  if (!base) return null;

  // NOTE: por ahora usamos "market" = mint, solo para validar plumbing.
  // Luego cambiaremos el runner a /snapshot?mint=... o el comando real del CLI.
  const u = `${base.replace(/\/+$/, "")}/snapshot?market=${encodeURIComponent(mint)}`;

  const res = await fetch(u, {
    cache: "no-store",
    headers: { "content-type": "application/json" },
  }).catch(() => null);

  if (!res || !res.ok) return null;

  const j = (await res.json().catch(() => null)) as RunnerResp | null;
  if (!j || (j as any).ok !== true) return null;

  return j;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mintFromQuery = url.searchParams.get("mint");

  const mint = (mintFromQuery || process.env.NEXT_PUBLIC_PERC_MINT || "").trim();
  const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
  const ts = Date.now();

  if (!mint) {
    return NextResponse.json({ ok: false, error: "MINT_REQUIRED" }, { status: 400 });
  }

  // Always fetch supply (cheap + useful). If it fails, keep nulls.
  const supplyPromise = fetchTokenSupplyUi(mint, rpcUrl).catch(() => null);

  // 1) Try Percolator runner (if configured)
  const runner = await tryRunnerSnapshot(mint).catch(() => null);

  // If runner works, return a snapshot that clearly indicates percolator source.
  // For now we don't map real price fields yet because runner CLI output isn't finalized.
  // We keep the response contract stable and show dexId as "percolator-cli".
  if (runner) {
    const supply = await supplyPromise;

    const snap: PercSnapshot = {
      ts,
      mint,

      // placeholder until we map real percolator fields:
      priceUsd: null,
      liquidityUsd: null,
      volume24hUsd: null,
      priceChange24hPct: null,

      pairUrl: null,
      dexId: "percolator-cli",

      supplyUi: supply?.supplyUi ?? null,
      decimals: supply?.decimals ?? null,
    };

    // Optional: include debug info only in dev (won't break UI)
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(
        { ...snap, _runner: runner },
        { headers: { "cache-control": "no-store" } }
      );
    }

    return NextResponse.json(snap, { headers: { "cache-control": "no-store" } });
  }

  // 2) Fallback to DexScreener (current working path)
  try {
    const [pair, supply] = await Promise.all([
      fetchDexScreenerBestPair(mint),
      supplyPromise,
    ]);

    const snap: PercSnapshot = {
      ts,
      mint,

      priceUsd: pair?.priceUsd ? Number(pair.priceUsd) : null,
      liquidityUsd: pair?.liquidity?.usd ?? null,
      volume24hUsd: pair?.volume?.h24 ?? null,
      priceChange24hPct: pair?.priceChange?.h24 ?? null,

      pairUrl: pair?.url ?? null,
      dexId: pair?.dexId ?? null,

      supplyUi: supply?.supplyUi ?? null,
      decimals: supply?.decimals ?? null,
    };

    return NextResponse.json(snap, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, ts, error: "SNAPSHOT_FAILED" }, { status: 500 });
  }
}
