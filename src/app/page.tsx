import HoldGate from "@/components/HoldGate/HoldGate";


export default function HomePage() {
  return (
    <main>
      {/* TOPBAR */}
      <div className="card topbar" style={{ marginBottom: 14 }}>
        <div className="logo">
          <span className="logoDot" />
          <span>PERCS Operator</span>
          <span className="kbd">BETA</span>
        </div>

        <div className="nav">
          <a href="/live">Pulse</a>
          <a href="/live" className="kbd">
            Paper
          </a>
          <a className="btn btnPrimary" href="/live">
            Open Live Terminal →
          </a>
        </div>
      </div>

      {/* HERO */}
      <section className="card cardPad" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 720 }}>
            <div className="badge badgeShield" style={{ marginBottom: 12 }}>
              <span className="logoDot" style={{ width: 8, height: 8 }} />
              REALTIME TOKEN INTELLIGENCE
            </div>

            <h1 className="h1">
              PERCS <span style={{ color: "var(--accent)" }}>Operator</span>
            </h1>

            <p className="p">
              A live market viewer + narrator. Paste any <b>Solana mint</b> and stream snapshots for <b>price</b>,{" "}
              <b>liquidity</b>, <b>volume</b> and <b>on-chain supply</b> into a readable terminal feed.
              <br />
              Paper-mode only. Powered by Ankr Solana RPC + market feeds. Percolator read-only dashboard coming next.
            </p>

            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <a className="btn btnPrimary" href="/live">
                Launch Live Terminal →
              </a>
              <a className="btn" href="/live">
                Explore Feed
              </a>
              <a className="btn" href="/operator">
                View Pulse
              </a>
            </div>
          </div>

          {/* SIDE METRICS */}
          <div style={{ minWidth: 280, maxWidth: 340 }}>
            <div className="card" style={{ background: "var(--card2)", padding: 14 }}>
              <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>Capabilities</div>

              <div style={{ display: "grid", gap: 10 }}>
                <div className="card" style={{ padding: 12, background: "rgba(0,0,0,0.18)" }}>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Market data</div>
                  <div style={{ marginTop: 6, fontWeight: 700 }}>Market feed (pairs)</div>
                </div>

                <div className="card" style={{ padding: 12, background: "rgba(0,0,0,0.18)" }}>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>On-chain</div>
                  <div style={{ marginTop: 6, fontWeight: 700 }}>Ankr RPC (Solana)</div>
                </div>

                <div className="card" style={{ padding: 12, background: "rgba(0,0,0,0.18)" }}>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Mode</div>
                  <div style={{ marginTop: 6, fontWeight: 700 }}>Paper-mode narrator</div>
                </div>
              </div>

              <div style={{ marginTop: 12, color: "var(--faint)", fontSize: 12, lineHeight: 1.6 }}>
                Tip: paste any Solana mint in Pulse and you’ll instantly switch targets.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOT DASHBOARD (PAPER) — TOKEN GATE */}
      <section className="card cardPad" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div className="badge" style={{ marginBottom: 10 }}>
              Bot Dashboard
            </div>
            <h3 className="h2">Operator Access</h3>
            <p className="p">
              90% of protocol fees are reserved as a <b>budget cap</b>. To watch the bot operate, hold at least{" "}
              <b>1,000,000 OPERCS</b>.
              <br />
              No deposits. No trading. This is a transparent simulation layer.
            </p>
          </div>

          <a className="btn btnPrimary" href="/operator">
            Open Pulse →
          </a>
        </div>

        <hr className="sep" />

        <div className="grid2">
          <div className="card" style={{ padding: 14, background: "rgba(0,0,0,0.18)" }}>
            <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>Check your holding</div>
            <p className="p" style={{ marginTop: 0 }}>
              Paste a wallet address to see if it meets the Operator threshold.
            </p>

            <div style={{ marginTop: 12 }}>
              <HoldGate />
            </div>
          </div>

          <div className="card" style={{ padding: 14, background: "rgba(0,0,0,0.18)" }}>
            <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>Setup</div>
            <div style={{ display: "grid", gap: 10 }}>
              <div className="badge" style={{ justifyContent: "space-between" }}>
                <span>Token</span>
                <span className="kbd">OPERCS</span>
              </div>
              <div className="badge" style={{ justifyContent: "space-between" }}>
                <span>Budget cap</span>
                <span className="kbd">90% fees</span>
              </div>
              <div className="badge" style={{ justifyContent: "space-between" }}>
                <span>Gate</span>
                <span className="kbd">1,000,000</span>
              </div>
            </div>

            <div style={{ marginTop: 12, color: "var(--faint)", fontSize: 12, lineHeight: 1.6 }}>
              Configure token mint + RPC in <span className="kbd">.env.local</span>.
            </div>
          </div>
        </div>
      </section>

      {/* GRID CARDS */}
      <section className="grid3" style={{ marginBottom: 14 }}>
        <div className="card cardPad">
          <div className="badge" style={{ marginBottom: 10 }}>
            Signals
          </div>
          <h3 className="h2">Pulse detection</h3>
          <p className="p">
            Detects abrupt price shifts, liquidity moves, and volatility spikes — narrated into a compact terminal feed.
          </p>
        </div>

        <div className="card cardPad">
          <div className="badge" style={{ marginBottom: 10 }}>
            Sources
          </div>
          <h3 className="h2">Percolator</h3>
          <p className="p">
            Uses Ankr Solana RPC for on-chain context. Percolator integration is read-only (status + commands) until
            markets are wired.
          </p>
        </div>

        <div className="card cardPad">
          <div className="badge" style={{ marginBottom: 10 }}>
            Roadmap
          </div>
          <h3 className="h2">Upgrade path</h3>
          <p className="p">Add watchlists, persistent history, alert rules, then wire Percolator read-only market stats.</p>
        </div>
      </section>

      {/* FOOTER CARD */}
      <section className="card cardPad">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 8 }}>Next steps</div>
            <div style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              Add a status bar (Ankr RPC, market, last tick), a watchlist drawer, a history timeline, and Percolator-market
              presets.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a className="btn btnPrimary" href="/live">
              Go Live →
            </a>
            <a className="btn" href="/live">
              View Feed
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
