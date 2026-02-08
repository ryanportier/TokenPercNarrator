"use client";

import { useEffect, useMemo, useState } from "react";

type HoldingResp =
  | {
      ok: true;
      wallet: string;
      mint: string;
      symbol: string;
      thresholdUi: number;
      balanceUi: number;
      eligible: boolean;
    }
  | { ok: false; error: string };

function shortAddr(a: string) {
  const s = (a || "").trim();
  if (s.length <= 14) return s || "—";
  return `${s.slice(0, 6)}…${s.slice(-6)}`;
}

function fmtInt(n: number) {
  // Stable formatting (no locale differences between SSR/Client)
  return String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function HoldGate() {
  const symbol = process.env.NEXT_PUBLIC_TOKEN_SYMBOL || "PERCS";
  const mint = process.env.NEXT_PUBLIC_TOKEN_MINT || process.env.NEXT_PUBLIC_PERC_MINT || "";
  const thresholdUi = Number(process.env.NEXT_PUBLIC_GATE_MIN_UI || 1_000_000);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [wallet, setWallet] = useState("");
  const [busy, setBusy] = useState(false);
  const [resp, setResp] = useState<HoldingResp | null>(null);

  const status = useMemo(() => {
    if (!resp) return null;
    if (!resp.ok) return { tone: "warn" as const, text: resp.error };
    return resp.eligible
      ? { tone: "ok" as const, text: `Eligible — ${fmtInt(resp.balanceUi)} ${resp.symbol}` }
      : { tone: "warn" as const, text: `Not enough — ${fmtInt(resp.balanceUi)} ${resp.symbol}` };
  }, [resp]);

  async function check() {
    const w = wallet.trim();
    if (!w) {
      setResp({ ok: false, error: "WALLET_REQUIRED" });
      return;
    }
    if (!mint) {
      setResp({ ok: false, error: "TOKEN_MINT_NOT_SET" });
      return;
    }

    setBusy(true);
    setResp(null);
    try {
      const res = await fetch(
        `/api/holding?wallet=${encodeURIComponent(w)}&mint=${encodeURIComponent(mint)}&symbol=${encodeURIComponent(
          symbol
        )}&min=${encodeURIComponent(String(thresholdUi))}`,
        { cache: "no-store" }
      );
      const j = (await res.json()) as HoldingResp;
      setResp(j);
    } catch {
      setResp({ ok: false, error: "NETWORK_ERROR" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <label className="label">Wallet</label>
      <input
        className="input"
        value={wallet}
        onChange={(e) => setWallet(e.target.value)}
        placeholder="Paste a Solana wallet address…"
        spellCheck={false}
      />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button className="btn btnPrimary" onClick={check} disabled={busy}>
          {busy ? "Checking…" : "Check holding"}
        </button>

        <span className="badge" title={mint}>
          <span>Mint</span>
          <span className="kbd">{shortAddr(mint)}</span>
        </span>

        <span className="badge">
          <span>Gate</span>
          <span className="kbd">
            {mounted ? fmtInt(thresholdUi) : "—"} {symbol}
          </span>
        </span>
      </div>

      {status ? (
        <div
          className="card"
          style={{
            padding: 12,
            background: "rgba(0,0,0,0.18)",
            borderColor: status.tone === "ok" ? "rgba(214,166,50,0.35)" : "var(--border)",
          }}
        >
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Result</div>
          <div style={{ fontWeight: 800 }}>{status.text}</div>

          {resp && resp.ok ? (
            <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 12, lineHeight: 1.6 }}>
              Wallet: <span className="kbd">{shortAddr(resp.wallet)}</span> · Token:{" "}
              <span className="kbd">{resp.symbol}</span>
            </div>
          ) : null}
        </div>
      ) : (
        <div style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.6 }}>
          Paper-mode gate: we only read SPL token balances. No wallet connect required.
        </div>
      )}
    </div>
  );
}
