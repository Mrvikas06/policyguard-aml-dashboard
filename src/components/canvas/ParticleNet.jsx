import { useRef, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// ParticleNet — Animated particle-network canvas (Sentinel monitor view)
// Particles drift and connect when within 80px — simulates live CDC network
// ─────────────────────────────────────────────────────────────────────────────

export function ParticleNet({ w = 400, h = 200 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx   = canvas.getContext("2d");
    canvas.width  = w;
    canvas.height = h;

    let raf;

    // Initialise random particles
    const pts = Array.from({ length: 40 }, () => ({
      x:  Math.random() * w,
      y:  Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r:  Math.random() * 1.5 + 0.5,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Move + draw dots
      pts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,212,200,0.5)";
        ctx.fill();
      });

      // Draw connecting lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 80) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(0,212,200,${0.15 * (1 - d / 80)})`;
            ctx.lineWidth   = 0.5;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h]);

  return (
    <canvas
      ref={ref}
      style={{ width: "100%", height: "100%", borderRadius: 8 }}
    />
  );
}
