export default function HomePage() {
  return (
    <main>
      {/* TOPBAR */}
      <div className="card topbar" style={{ marginBottom: 14 }}>
        <div className="logo">
          <span className="logoDot" />
          <span>Token Pulse</span>
          <span className="kbd">BETA</span>
        </div>

        <div className="nav">
          <a href="/live">Live</a>
          <a href="https://docs.dexscreener.com/api/reference" target="_blank" rel="noreferrer">
            DexScreener
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
              Token <span style={{ color: "var(--accent)" }}>Pulse</span>
            </h1>

            <p className="p">
              A live market viewer + narrator. Paste any <b>Solana mint</b> and stream snapshots for{" "}
              <b>price</b>, <b>liquidity</b>, <b>volume</b> and <b>on-chain supply</b> into a readable terminal feed.
              <br />
              Powered by percolator-cli snapshots.            </p>

            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <a className="btn btnPrimary" href="/live">
                Launch Live Terminal →
              </a>
              <a className="btn" href="/live">
                Explore Feed
              </a>
              <a className="btn" href="https://docs.dexscreener.com/api/reference" target="_blank" rel="noreferrer">
                API Docs
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
                  <div style={{ marginTop: 6, fontWeight: 700 }}>DexScreener pairs</div>
                </div>

                <div className="card" style={{ padding: 12, background: "rgba(0,0,0,0.18)" }}>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>On-chain</div>
                  <div style={{ marginTop: 6, fontWeight: 700 }}>Solana supply</div>
                </div>

                <div className="card" style={{ padding: 12, background: "rgba(0,0,0,0.18)" }}>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Mode</div>
                  <div style={{ marginTop: 6, fontWeight: 700 }}>Paper narrator</div>
                </div>
              </div>

              <div style={{ marginTop: 12, color: "var(--faint)", fontSize: 12, lineHeight: 1.6 }}>
                Tip: paste a mint in Live Terminal and you’ll instantly switch targets.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GRID CARDS */}
      <section className="grid3" style={{ marginBottom: 14 }}>
        <div className="card cardPad">
          <div className="badge" style={{ marginBottom: 10 }}>Signals</div>
          <h3 className="h2">Pulse detection</h3>
          <p className="p">
            Detects abrupt mark/price shifts, funding changes, and liquidity moves from Percolator snapshots — narrated into a compact terminal feed.
          </p>
        </div>

        <div className="card cardPad">
          <div className="badge" style={{ marginBottom: 10 }}>Sources</div>
          <h3 className="h2">Percolator + Ankr RPC</h3>
          <p className="p">
            Uses Percolator CLI for market snapshots and Ankr Solana RPC for on-chain context — fast, consistent, and verifiable.
          </p>
        </div>

        <div className="card cardPad">
          <div className="badge" style={{ marginBottom: 10 }}>Roadmap</div>
          <h3 className="h2">Upgrade path</h3>
          <p className="p">
            Add watchlists, persistent history, alert rules, then upgrade to devnet execution when you’re ready.
          </p>
        </div>
      </section>

      {/* FOOTER CARD */}
      <section className="card cardPad">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 8 }}>Next steps</div>
            <div style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              Want it to feel more “terminal”? We can add a live status bar (Ankr RPC, market, last tick), a watchlist drawer, a history timeline, and Percolator-market presets.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a className="btn btnPrimary" href="/live">Go Live →</a>
            <a className="btn" href="/live">View Feed</a>
          </div>
        </div>
      </section>
    </main>
  );
}
