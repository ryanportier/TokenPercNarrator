"use client";

import { useMemo, useState } from "react";


type HoldingResp =
  | { ok: true; balanceUi: number; eligible: boolean; thresholdUi: number; symbol: string }
  | { ok: false; error: string };

type RunnerResp =
  | { ok: true; stdout?: string; note?: string; cli?: any }
  | { ok: false; error: string; detail?: any };

function fmtInt(n: number) {
  return String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <span className="badge" style={{ justifyContent: "space-between", width: "100%" }}>
      <span>{label}</span>
      <span className="kbd">{value}</span>
    </span>
  );
}

export default function OperatorClient() {
  const symbol = process.env.NEXT_PUBLIC_TOKEN_SYMBOL || "PERCS";
  const mint = process.env.NEXT_PUBLIC_TOKEN_MINT || process.env.NEXT_PUBLIC_PERC_MINT || "";
  const thresholdUi = Number(process.env.NEXT_PUBLIC_GATE_MIN_UI || 1_000_000);

  const runnerBase = (process.env.NEXT_PUBLIC_PERCOLATOR_API_URL ||
    process.env.NEXT_PUBLIC_RUNNER_URL ||
    "").trim();

  const [wallet, setWallet] = useState("");
  const [checking, setChecking] = useState(false);
  const [holding, setHolding] = useState<HoldingResp | null>(null);

  const [loadingRunner, setLoadingRunner] = useState(false);
  const [runnerVersion, setRunnerVersion] = useState<RunnerResp | null>(null);
  const [runnerHelp, setRunnerHelp] = useState<RunnerResp | null>(null);

  const eligible = holding?.ok ? holding.eligible : false;

  const treasuryPaperUsd = useMemo(() => {
    // Paper placeholder (later: real fees)
    return 0;
  }, []);

  const [treasurySol, setTreasurySol] = useState<number | null>(null);
  async function loadTreasury() {
  try {
    const res = await fetch("/api/treasury", { cache: "no-store" });
    const j = await res.json();
    if (j?.ok) setTreasurySol(Number(j.sol));
  } catch {}
}

  async function checkHolding() {
    if (!wallet.trim()) {
      setHolding({ ok: false, error: "WALLET_REQUIRED" });
      return;
    }
    if (!mint) {
      setHolding({ ok: false, error: "TOKEN_MINT_NOT_SET" });
      return;
    }

    setChecking(true);
    setHolding(null);

    try {
      const res = await fetch(
        `/api/holding?wallet=${encodeURIComponent(wallet.trim())}&mint=${encodeURIComponent(
          mint
        )}&symbol=${encodeURIComponent(symbol)}&min=${encodeURIComponent(String(thresholdUi))}`,
        { cache: "no-store" }
      );
      const j = (await res.json()) as any;
      if (j?.ok) {
        setHolding({
          ok: true,
          balanceUi: Number(j.balanceUi || 0),
          eligible: Boolean(j.eligible),
          thresholdUi: Number(j.thresholdUi || thresholdUi),
          symbol: String(j.symbol || symbol),
        });
      } else {
        setHolding({ ok: false, error: String(j?.error || "CHECK_FAILED") });
      }
    } catch {
      setHolding({ ok: false, error: "NETWORK_ERROR" });
    } finally {
      setChecking(false);
    }
  }

  async function loadRunner() {
    if (!runnerBase) {
      setRunnerVersion({ ok: true, note: "Runner URL not set (paper).", stdout: "" });
      setRunnerHelp({ ok: true, note: "Runner URL not set (paper).", stdout: "" });
      return;
    }

    setLoadingRunner(true);
    try {
      const [vRes, hRes] = await Promise.all([
        fetch(`${runnerBase}/percolator/version`, { cache: "no-store" }),
        fetch(`${runnerBase}/percolator/help`, { cache: "no-store" }),
      ]);

      const v = (await vRes.json()) as any;
      const h = (await hRes.json()) as any;

      setRunnerVersion(v?.ok ? { ok: true, ...v } : { ok: false, error: "RUNNER_VERSION_FAILED", detail: v });
      setRunnerHelp(h?.ok ? { ok: true, ...h } : { ok: false, error: "RUNNER_HELP_FAILED", detail: h });
    } catch {
      setRunnerVersion({ ok: false, error: "RUNNER_NETWORK_ERROR" });
      setRunnerHelp({ ok: false, error: "RUNNER_NETWORK_ERROR" });
    } finally {
      setLoadingRunner(false);
    }
  }

  return (
    <main>
      {/* Topbar */}
      <div className="card topbar" style={{ marginBottom: 14 }}>
        <div className="logo">
          <span className="logoDot" />
          <span>PERCS Operator</span>
          <span className="kbd">Dashboard</span>
        </div>

        <div className="nav">
          <a href="/">Home</a>
          <a href="/live">Pulse</a>
          <a className="btn btnPrimary" href="/live">
            Open Terminal →
          </a>
        </div>
      </div>

      {/* Header */}
      <section className="card cardPad" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 720 }}>
            <div className="badge badgeShield" style={{ marginBottom: 12 }}>
              OPERATOR ACCESS · PAPER MODE
            </div>

            <h1 className="h1">
              Bot Dashboard <span style={{ color: "var(--accent)" }}>(Paper)</span>
            </h1>

            <p className="p">
              Read-only control room for Percolator signals + simulated execution logs. No deposits, no trading, no
              wallet connect required — only holding verification for access.
            </p>

            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <button className="btn btnPrimary" onClick={loadRunner} disabled={loadingRunner}>
                {loadingRunner ? "Loading…" : "Load Percolator Status"}
              </button>
              <a className="btn" href="/live">
                View Pulse Feed
              </a>
            </div>
          </div>

          {/* Status column */}
          <div style={{ minWidth: 280, maxWidth: 360, width: "100%" }}>
            <div className="card" style={{ background: "var(--card2)", padding: 14 }}>
              <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>System Status</div>
              <div style={{ display: "grid", gap: 10 }}>
                <Badge label="Mode" value="Paper" />
                <Badge label="Budget cap" value="90% fees" />
                <Badge label="Token gate" value={`${fmtInt(thresholdUi)} ${symbol}`} />
                <Badge label="RPC" value="Ankr (Solana)" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gate + Treasury */}
      <section className="grid2" style={{ marginBottom: 14 }}>
        {/* Gate card */}
        <div className="card cardPad">
          <div className="badge" style={{ marginBottom: 10 }}>
            Access Gate
          </div>
          <h3 className="h2">Verify holding</h3>
          <p className="p" style={{ marginTop: 0 }}>
            Paste a wallet address to unlock the Operator dashboard panels.
          </p>

          <div style={{ marginTop: 12 }}>
            <label className="label">Wallet</label>
            <input
              className="input"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="Solana wallet address…"
              spellCheck={false}
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
            <button className="btn btnPrimary" onClick={checkHolding} disabled={checking}>
              {checking ? "Checking…" : "Check"}
            </button>
            <span className="badge">
              Gate <span className="kbd">{fmtInt(thresholdUi)}</span> {symbol}
            </span>
          </div>

          {holding ? (
            holding.ok ? (
              <div
                className="card"
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: "rgba(0,0,0,0.18)",
                  borderColor: holding.eligible ? "rgba(214,166,50,0.35)" : "var(--border)",
                }}
              >
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Result</div>
                <div style={{ fontWeight: 800 }}>
                  {holding.eligible ? "Eligible" : "Not enough"} — {fmtInt(holding.balanceUi)} {holding.symbol}
                </div>
              </div>
            ) : (
              <div className="card" style={{ marginTop: 12, padding: 12, background: "rgba(0,0,0,0.18)" }}>
                <div style={{ fontWeight: 800 }}>Error</div>
                <div style={{ color: "var(--muted)", marginTop: 6 }}>{holding.error}</div>
              </div>
            )
          ) : (
            <div style={{ marginTop: 12, color: "var(--muted)", fontSize: 12, lineHeight: 1.6 }}>
              This gate only reads SPL token balances (read-only).
            </div>
          )}
        </div>

        {/* Treasury card */}
        <div className="card cardPad">
          <div className="badge" style={{ marginBottom: 10 }}>
            Treasury (Paper)
          </div>
          <h3 className="h2">Fee-funded budget</h3>
          <p className="p" style={{ marginTop: 0 }}>
            90% of system fees are reserved for the bot budget cap. Today this is simulated — later it becomes on-chain
            observable.
          </p>

          <hr className="sep" />

          <div className="grid2">
            <div className="card" style={{ padding: 12, background: "rgba(0,0,0,0.18)" }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Treasury</div>
              <div style={{ marginTop: 6, fontWeight: 900, fontSize: 22 }}>${treasuryPaperUsd.toFixed(2)}</div>
            </div>
            <div className="card" style={{ padding: 12, background: "rgba(0,0,0,0.18)" }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Budget cap</div>
              <div style={{ marginTop: 6, fontWeight: 900, fontSize: 22 }}>90%</div>
            </div>
          </div>

          <div style={{ marginTop: 12, color: "var(--faint)", fontSize: 12, lineHeight: 1.6 }}>
            Next: wire fee receipts + publish distribution math.
          </div>
        </div>
      </section>

      {/* Locked panels */}
      <section className="grid3" style={{ marginBottom: 14, opacity: eligible ? 1 : 0.55 }}>
        <div className="card cardPad">
          <div className="badge" style={{ marginBottom: 10 }}>
            Risk Rules
          </div>
          <h3 className="h2">Circuit breakers</h3>
          <p className="p">
            Max daily loss, volatility pause, size caps, and a “kill switch” for abnormal conditions. Paper-mode now —
            enforced later.
          </p>
        </div>

        <div className="card cardPad">
          <div className="badge" style={{ marginBottom: 10 }}>
            Signals
          </div>
          <h3 className="h2">Percolator observers</h3>
          <p className="p">
            Read-only status endpoints and market presets. We’ll expose funding/mark/OI when the CLI wiring is final.
          </p>
        </div>

        <div className="card cardPad">
          <div className="badge" style={{ marginBottom: 10 }}>
            Audit Log
          </div>
          <h3 className="h2">Transparent timeline</h3>
          <p className="p">
            Every “tick” is logged: inputs, decisions, simulated allocations, and the reason. Exportable later.
          </p>
        </div>
      </section>

      {!eligible ? (
        <section className="card cardPad" style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Locked</div>
              <div style={{ color: "var(--muted)", lineHeight: 1.7 }}>
                Hold <span className="kbd">{fmtInt(thresholdUi)}</span> {symbol} to unlock the Operator panels.
              </div>
            </div>
            <a className="btn btnPrimary" href="/live">
              Go to Pulse →
            </a>
          </div>
        </section>
      ) : null}

      {/* Percolator runner info (read-only) */}
      <section className="card cardPad">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div className="badge" style={{ marginBottom: 10 }}>
              Percolator Runner
            </div>
            <h3 className="h2">Read-only status</h3>
            <p className="p" style={{ marginTop: 0 }}>
              This reads <span className="kbd">/percolator/version</span> and <span className="kbd">/percolator/help</span>{" "}
              from your Render runner (if configured).
            </p>
          </div>

          <button className="btn btnPrimary" onClick={loadRunner} disabled={loadingRunner}>
            {loadingRunner ? "Loading…" : "Refresh"}
          </button>
        </div>

        <hr className="sep" />

        <div className="grid2">
          <div className="card" style={{ padding: 12, background: "rgba(0,0,0,0.18)" }}>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Version</div>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: "var(--text)", fontFamily: "var(--mono)", fontSize: 12 }}>
              {runnerVersion?.ok
                ? runnerVersion.stdout || runnerVersion.note || "—"
                : runnerVersion?.error || "—"}
            </pre>
          </div>

          <div className="card" style={{ padding: 12, background: "rgba(0,0,0,0.18)" }}>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Help</div>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: "var(--text)", fontFamily: "var(--mono)", fontSize: 12 }}>
              {runnerHelp?.ok ? runnerHelp.stdout || runnerHelp.note || "—" : runnerHelp?.error || "—"}
            </pre>
          </div>
        </div>

        <div style={{ marginTop: 12, color: "var(--faint)", fontSize: 12, lineHeight: 1.6 }}>
          Set <span className="kbd">NEXT_PUBLIC_PERCOLATOR_API_URL</span> to your Render runner base URL to enable this.
        </div>
      </section>
    </main>
  );
}
