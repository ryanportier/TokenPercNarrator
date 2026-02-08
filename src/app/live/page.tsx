import LiveFeed from "@/components/LiveFeed/LiveFeed";

export default function LivePage() {
  return (
    <main>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>LIVE FEED</h1>
          <p style={{ margin: "10px 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
            Viewer + Narrator. Pulling snapshots every ~10s (BETA).
          </p>
        </div>

        <a
          href="/"
          style={{
            padding: "10px 12px",
            border: "1px solid var(--border)",
            borderRadius: 12,
            background: "var(--panel)",
          }}
        >
          ← HOME
        </a>
      </header>

      <div style={{ marginTop: 16 }}>
        <LiveFeed />
      </div>
    </main>
  );
}
