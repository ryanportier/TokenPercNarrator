<p align="center">
  <img src="./public/logo.png" alt="Token Pulse Logo" width="180" />
</p>

<h1 align="center">Token Pulse</h1>

<p align="center">
  <b>Realtime token intelligence</b> — a live market viewer + narrator.<br/>
  Paste any Solana mint and stream snapshots into a readable terminal feed. <i>Paper-mode only.</i>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#local-development">Local Development</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#environment-variables">Env Vars</a>
</p>

---

## What is Token Pulse?

**Token Pulse** is a **paper-only market terminal** that turns a Solana mint into a live feed of snapshots + narrated signals.

- You paste a mint.
- The system fetches snapshots every few seconds.
- A compact “narrator” writes events like **price pulses**, **liquidity shifts**, and **volatility spikes**.
- No wallet connect. No trades. **Observer mode only.**

---

## Features

- **Live Terminal Feed** (readable, compact, “AI-style” narration)
- **Any Solana mint input** (switch targets instantly)
- **Snapshot loop** (polling every ~10s)
- **Paper-mode** by default (safe, no execution)
- **Pluggable data source**
  - `percolator-runner` (Percolator CLI on Render)
  - optional fallback to DexScreener + RPC supply (if enabled)

---

## Architecture

This repo is a simple monorepo:

