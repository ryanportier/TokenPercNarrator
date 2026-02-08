import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RpcResp = any;

function asNum(x: any): number {
  const n = typeof x === "number" ? x : Number(x);
  return Number.isFinite(n) ? n : 0;
}

async function rpc(url: string, method: string, params: any[]) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`RPC_${res.status}`);
  return (await res.json()) as RpcResp;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const wallet = String(url.searchParams.get("wallet") || "").trim();
  const mint = String(url.searchParams.get("mint") || "").trim();
  const symbol = String(url.searchParams.get("symbol") || "PERCS").trim();
  const thresholdUi = asNum(url.searchParams.get("min"));

  if (!wallet) return NextResponse.json({ ok: false, error: "WALLET_REQUIRED" }, { status: 400 });
  if (!mint) return NextResponse.json({ ok: false, error: "MINT_REQUIRED" }, { status: 400 });

  const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

  try {
    const j = await rpc(rpcUrl, "getTokenAccountsByOwner", [
      wallet,
      { mint },
      { encoding: "jsonParsed" },
    ]);

    const accounts = j?.result?.value || [];
    let balanceUi = 0;

    for (const a of accounts) {
      const ui = a?.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
      balanceUi += asNum(ui);
    }

    const eligible = balanceUi >= (thresholdUi || 0);

    return NextResponse.json(
      { ok: true, wallet, mint, symbol, thresholdUi: thresholdUi || 0, balanceUi, eligible },
      { headers: { "cache-control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ ok: false, error: "HOLDING_CHECK_FAILED" }, { status: 500 });
  }
}
