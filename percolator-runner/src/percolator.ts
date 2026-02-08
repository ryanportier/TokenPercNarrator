import { spawn } from "node:child_process";

type RunResult =
  | { ok: true; stdout: string }
  | { ok: false; error: string; code?: number; stderr?: string };

const BIN = (process.env.PERCOLATOR_BIN || "percolator").trim();

export function runPercolator(args: string[], timeoutMs = 12_000): Promise<RunResult> {
  return new Promise((resolve) => {
    const p = spawn(BIN, args, { stdio: ["ignore", "pipe", "pipe"] });

    let stdout = "";
    let stderr = "";

    const t = setTimeout(() => {
      try { p.kill("SIGKILL"); } catch {}
      resolve({ ok: false, error: "TIMEOUT" });
    }, timeoutMs);

    p.on("error", (err: any) => {
      clearTimeout(t);
      resolve({ ok: false, error: "SPAWN_ERROR", stderr: String(err?.message || err) });
    });

    p.stdout?.on("data", (d) => (stdout += d.toString()));
    p.stderr?.on("data", (d) => (stderr += d.toString()));

    p.on("close", (code) => {
      clearTimeout(t);
      if (code === 0) return resolve({ ok: true, stdout: stdout.trim() });
      resolve({ ok: false, error: "CLI_FAILED", code: code ?? undefined, stderr: (stderr || "").trim() });
    });
  });
}
