"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  z: number; // 0..1 depth
  r: number;
  vx: number;
  vy: number;
  tw: number;
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const starsRef = useRef<Star[]>([]);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;

      sizeRef.current = { w, h, dpr };

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Dense but not too heavy
      const base = Math.floor((w * h) / 8500);
      const count = Math.max(260, Math.min(1400, base));

      const stars: Star[] = [];
      for (let i = 0; i < count; i++) {
        const z = rand(0.12, 1);
        const r = rand(0.6, 2.2) * (1.2 - z);
        stars.push({
          x: rand(0, w),
          y: rand(0, h),
          z,
          r,
          vx: rand(0.10, 0.55) * (1.35 - z),
          vy: rand(-0.06, 0.14) * (1.35 - z),
          tw: rand(0, Math.PI * 2),
        });
      }
      starsRef.current = stars;
    };

    build();
    window.addEventListener("resize", build);

    // First paint
    ctx.fillStyle = "rgba(11,15,20,1)";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    let last = performance.now();

    const loop = (now: number) => {
      const { w, h } = sizeRef.current;
      const dt = Math.min((now - last) / 16.67, 2);
      last = now;

      // Trail fade
      ctx.fillStyle = "rgba(11,15,20,0.30)";
      ctx.fillRect(0, 0, w, h);

      // Vignette
      const vg = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, Math.max(w, h) * 0.85);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      for (const s of starsRef.current) {
        s.x -= s.vx * dt;
        s.y += s.vy * dt;

        if (s.x < -20) s.x = w + 20;
        if (s.x > w + 20) s.x = -20;
        if (s.y < -20) s.y = h + 20;
        if (s.y > h + 20) s.y = -20;

        // Twinkle
        s.tw += 0.02 * (1.15 - s.z) * dt;
        const tw = 0.65 + 0.35 * Math.sin(s.tw);

        const alpha = (0.18 + 0.82 * (1 - s.z)) * tw;

        // Glow
        ctx.globalAlpha = alpha * 0.55;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.fill();

        // Core
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", build);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />;
}
