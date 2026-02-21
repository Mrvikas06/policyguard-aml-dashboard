// ─────────────────────────────────────────────────────────────────────────────
// Donut — Animated SVG donut chart for AML compliance score
// ─────────────────────────────────────────────────────────────────────────────

export function Donut({ pct, col, size = 130, label }) {
  const r    = size * 0.36;
  const circ = 2 * Math.PI * r;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {/* SVG ring */}
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="#162038"
          strokeWidth={size * 0.09}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={col}
          strokeWidth={size * 0.09}
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
          strokeLinecap="round"
          style={{
            transition: "stroke-dasharray 1.8s cubic-bezier(.4,0,.2,1)",
            filter:     `drop-shadow(0 0 10px ${col})`,
          }}
        />
      </svg>

      {/* Centre text */}
      <div
        style={{
          position:       "absolute",
          inset:          0,
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize:   size * 0.195,
            fontWeight: 900,
            color:      col,
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1,
          }}
        >
          {pct}%
        </div>
        {label && (
          <div style={{ fontSize: size * 0.075, color: "#3a5878", letterSpacing: "0.1em", marginTop: 2 }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
