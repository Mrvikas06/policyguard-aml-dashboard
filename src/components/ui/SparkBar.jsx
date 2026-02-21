// ─────────────────────────────────────────────────────────────────────────────
// SparkBar — Compact bar sparkline used inside KPI cards
// ─────────────────────────────────────────────────────────────────────────────

export function SparkBar({ data, color }) {
  const max = Math.max(...data);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 28 }}>
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            flex:          1,
            height:        `${Math.max(8, (v / max) * 100)}%`,
            background:    color,
            borderRadius:  "2px 2px 0 0",
            opacity:       0.4 + (i / data.length) * 0.6,
            transition:    `height 0.8s ease ${i * 40}ms`,
          }}
        />
      ))}
    </div>
  );
}
