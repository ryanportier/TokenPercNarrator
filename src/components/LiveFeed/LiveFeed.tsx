"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./LiveFeed.module.css";

type Snapshot = {
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

type FeedLine = {
  id: string;
  ts: number;
  text: string;
  tone: "ok" | "warn" | "danger";
};

function fmtUsd(n: number | null) {
  if (n === null || Number.isNaN(n)) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(6)}`;
}

function fmtPct(n: number | null) {
  if (n === null || Number.isNaN(n)) return "—";
  const s = n >= 0 ? "+" : "";
  return `${s}${n.toFixed(2)}%`;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function shortMint(mint: string) {
  const m = (mint || "").trim();
  if (m.length <= 14) return m || "—";
  return `${m.slice(0, 6)}…${m.slice(-6)}`;
}

export default function LiveFeed() {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [lines, setLines] = useState<FeedLine[]>([
    { id: makeId(), ts: Date.now(), text: "Booting narrator…", tone: "ok" },
  ]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [mint, setMint] = useState(() => process.env.NEXT_PUBLIC_PERC_MINT || "");
  const [mintDraft, setMintDraft] = useState(() => process.env.NEXT_PUBLIC_PERC_MINT || "");

  const lastSnapRef = useRef<Snapshot | null>(null);

  const headline = useMemo(() => {
    if (!snap) return "Waiting for first snapshot…";
    return `${shortMint(snap.mint)} @ ${fmtUsd(snap.priceUsd)} | 24h ${fmtPct(
      snap.priceChange24hPct
    )} | liq ${fmtUsd(snap.liquidityUsd)}`;
  }, [snap]);

  function push(text: string, tone: FeedLine["tone"] = "ok") {
    setLines((prev) => [{ id: makeId(), ts: Date.now(), text, tone }, ...prev].slice(0, 80));
  }

  function narrate(next: Snapshot, prev: Snapshot | null) {
    if (!prev) {
      push(`Connected. Tracking mint ${shortMint(next.mint)}.`, "ok");
      return;
    }

    if (next.priceUsd !== null && prev.priceUsd !== null && prev.priceUsd !== 0) {
      const delta = (next.priceUsd - prev.priceUsd) / prev.priceUsd;
      if (Math.abs(delta) >= 0.01) {
        const dir = delta > 0 ? "UP" : "DOWN";
        const tone = delta > 0 ? "ok" : "warn";
        push(`Pulse: price moved ${dir} ${(Math.abs(delta) * 100).toFixed(2)}% since last tick.`, tone);
      }
    }

    if (next.liquidityUsd !== null && prev.liquidityUsd !== null) {
      const base = Math.max(prev.liquidityUsd, 1);
      const liqDelta = (next.liquidityUsd - prev.liquidityUsd) / base;
      if (Math.abs(liqDelta) >= 0.08) {
        push(`Liquidity shift: ${(liqDelta * 100).toFixed(1)}% vs last tick.`, liqDelta < 0 ? "warn" : "ok");
      }
    }

    if (next.priceChange24hPct !== null && Math.abs(next.priceChange24hPct) >= 10) {
      push(`Volatility high (${fmtPct(next.priceChange24hPct)} 24h).`, "danger");
    }
  }

  async function tick(targetMint = mint) {
    const clean = (targetMint || "").trim();
    if (!clean) {
      push("Paste a Solana mint to start tracking.", "warn");
      return;
    }

    const res = await fetch(`/api/snapshot?mint=${encodeURIComponent(clean)}`, { cache: "no-store" });
    if (!res.ok) throw new Error("snapshot failed");
    const next = (await res.json()) as Snapshot;

    setSnap(next);
    narrate(next, lastSnapRef.current);
    lastSnapRef.current = next;
  }

  function applyMint(nextMint: string) {
    const clean = (nextMint || "").trim();
    setMint(clean);
    lastSnapRef.current = null;
    push(`Switching target → ${shortMint(clean)}`, "ok");
  }

  // IMPORTANT: interval re-initializes when mint changes
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        await tick(mint);
        if (!alive) return;
        push("First snapshot locked.", "ok");
      } catch {
        push("Snapshot error. Retrying…", "warn");
      }
    })();

    const iv = setInterval(() => {
      tick(mint).catch(() => push("Snapshot error. Retrying…", "warn"));
    }, 10_000);

    return () => {
      alive = false;
      clearInterval(iv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mint]);

  return (
    <section className={styles.card}>
      <div className={styles.topRow}>
        <div className={styles.headline}>{headline}</div>
        {snap?.pairUrl ? (
          <a className={styles.link} href={snap.pairUrl} target="_blank" rel="noreferrer">
            DEX →
          </a>
        ) : (
          <span className={styles.muted}>DEX →</span>
        )}
      </div>

      {/* Mint input row */}
      <div className={styles.mintRow}>
        <input
          className={styles.mintInput}
          value={mintDraft}
          onChange={(e) => setMintDraft(e.target.value)}
          placeholder="Paste Solana mint…"
          spellCheck={false}
        />
        <button
          className={styles.mintBtn}
          onClick={() => {
            applyMint(mintDraft);
            tick(mintDraft).catch(() => push("Snapshot error. Retrying…", "warn"));
          }}
        >
          Track
        </button>
      </div>

      <div className={styles.grid}>
        <div className={styles.kv}>
          <div className={styles.k}>Mint</div>
          <div className={styles.v}>{snap ? shortMint(snap.mint) : shortMint(mint)}</div>
        </div>

        <div className={styles.kv}>
          <div className={styles.k}>Price</div>
          <div className={styles.v}>{fmtUsd(snap?.priceUsd ?? null)}</div>
        </div>

        <div className={styles.kv}>
          <div className={styles.k}>24h Change</div>
          <div className={styles.v}>{fmtPct(snap?.priceChange24hPct ?? null)}</div>
        </div>

        <div className={styles.kv}>
          <div className={styles.k}>Liquidity</div>
          <div className={styles.v}>{fmtUsd(snap?.liquidityUsd ?? null)}</div>
        </div>

        <div className={styles.kv}>
          <div className={styles.k}>24h Volume</div>
          <div className={styles.v}>{fmtUsd(snap?.volume24hUsd ?? null)}</div>
        </div>

        <div className={styles.kv}>
          <div className={styles.k}>Supply</div>
          <div className={styles.v}>{snap?.supplyUi ?? "—"}</div>
        </div>

        <div className={styles.kv}>
          <div className={styles.k}>DEX</div>
          <div className={styles.v}>{snap?.dexId ?? "—"}</div>
        </div>
      </div>

      <div className={styles.feed}>
        {lines.map((l) => (
          <div key={l.id} className={`${styles.line} ${styles[l.tone]}`}>
            <span className={styles.ts}>
              {mounted ? new Date(l.ts).toLocaleTimeString() : "--:--:--"}
            </span>
            <span className={styles.txt}>{l.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
