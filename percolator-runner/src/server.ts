import express from "express";
import { runPercolator } from "./percolator";

const app = express();

const PORT = Number(process.env.PORT || 3000);
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

let cache: { key: string; ts: number; payload: any } | null = null;
const CACHE_MS = 10_000;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "percolator-runner", ts: Date.now() });
});

app.get("/snapshot", async (req, res) => {
  const market = String(req.query.market || "").trim();
  if (!market) return res.status(400).json({ ok: false, error: "MARKET_REQUIRED" });

  const key = `market:${market}`;
  const now = Date.now();

  if (cache && cache.key === key && now - cache.ts < CACHE_MS) {
    return res.json({ ok: true, cached: true, ...cache.payload });
  }

  const args = ["--rpc", SOLANA_RPC_URL, "snapshot", "--market", market, "--json"];
  const r = await runPercolator(args, 12_000);

  // If CLI doesn't exist locally, return a friendly payload, don't crash.
  if (!r.ok) {
    const payload = {
      ts: now,
      market,
      runner: "ok",
      note:
        r.error === "SPAWN_ERROR"
          ? "percolator binary not found locally (expected). In Render Docker it will exist."
          : "percolator command failed (args may not match CLI).",
      cli: r,
    };
    cache = { key, ts: now, payload };
    return res.json({ ok: true, cached: false, ...payload });
  }

  let data: any = null;
  try {
    data = JSON.parse(r.stdout);
  } catch {
    data = { raw: r.stdout };
  }

  const payload = { ts: now, market, data };
  cache = { key, ts: now, payload };
  return res.json({ ok: true, cached: false, ...payload });
});

app.listen(PORT, () => {
  console.log(`percolator-runner listening on :${PORT}`);
});
