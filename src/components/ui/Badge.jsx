// ─────────────────────────────────────────────────────────────────────────────
// Badge — Glowing pill badge used throughout the dashboard
// ─────────────────────────────────────────────────────────────────────────────

export function Badge({ lbl, col, sm = false }) {
  return (
    <span
      style={{
        background:     col + "18",
        color:          col,
        border:         `1px solid ${col}35`,
        padding:        sm ? "1px 7px" : "3px 10px",
        borderRadius:   4,
        fontSize:       sm ? 9 : 10,
        fontWeight:     700,
        letterSpacing:  "0.07em",
        textTransform:  "uppercase",
        fontFamily:     "'JetBrains Mono', monospace",
        whiteSpace:     "nowrap",
      }}
    >
      {lbl}
    </span>
  );
}
