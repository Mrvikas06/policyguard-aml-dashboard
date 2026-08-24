// ─────────────────────────────────────────────────────────────────────────────
// Progress — simple animated progress bar
// ─────────────────────────────────────────────────────────────────────────────

import { C } from "../../theme/colors";

export function Progress({ value = 0, color = C.brand, height = 8, style, className = "" }) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height,
        background: C.panelAlt,
        borderRadius: 999,
        overflow: "hidden",
        border: `1px solid ${C.border}`,
        ...style,
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: color,
          borderRadius: 999,
          transition: "width .25s ease",
        }}
      />
    </div>
  );
}