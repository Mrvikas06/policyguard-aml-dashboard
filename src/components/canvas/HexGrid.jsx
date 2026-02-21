import { useRef, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// HexGrid — Animated teal hexagonal grid canvas (hero background)
// Each hex cell pulses in a wave pattern driven by time + position
// ─────────────────────────────────────────────────────────────────────────────

export function HexGrid() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let raf;
    let t = 0;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    /** Draw a single hexagon at (cx, cy) with outer radius r and stroke opacity alpha */
    const drawHex = (cx, cy, r, alpha) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(0,212,200,${alpha})`;
      ctx.lineWidth   = 0.5;
      ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.003;

      const r    = 32;
      const cols = Math.ceil(canvas.width  / (r * 1.74)) + 2;
      const rows = Math.ceil(canvas.height / (r * 1.5))  + 2;

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const cx    = col * r * 1.74 + (row % 2 === 0 ? 0 : r * 0.87);
          const cy    = row * r * 1.5;
          const wave  = Math.sin(t + col * 0.4 + row * 0.3) * 0.5 + 0.5;
          const alpha = wave * 0.06 + 0.015;
          drawHex(cx, cy, r - 1, alpha);
        }
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position:      "absolute",
        inset:         0,
        width:         "100%",
        height:        "100%",
        pointerEvents: "none",
        opacity:       0.7,
      }}
    />
  );
}
