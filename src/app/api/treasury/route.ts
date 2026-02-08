import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function rpc(rpcUrl: string, method: string, params: any[]) {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`RPC_${res.status}`);
  return res.json();
}

export async function GET() {
  const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
  const wallet = (process.env.TREASURY_WALLET || "").trim();
  const ts = Date.now();

  if (!wallet) {
    return NextResponse.json({ ok: false, error: "TREASURY_WALLET_NOT_SET" }, { status: 400 });
  }

  try {
    const j = await rpc(rpcUrl, "getBalance", [wallet, { commitment: "confirmed" }]);
    const lamports = Number(j?.result?.value ?? 0);
    const sol = lamports / 1_000_000_000;

    return NextResponse.json(
      { ok: true, ts, wallet, sol, lamports },
      { headers: { "cache-control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ ok: false, ts, error: "TREASURY_FETCH_FAILED" }, { status: 500 });
  }
}
