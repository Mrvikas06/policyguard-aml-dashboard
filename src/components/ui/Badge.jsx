// ─────────────────────────────────────────────────────────────────────────────
// Badge — compact status pill for enterprise surfaces
// ─────────────────────────────────────────────────────────────────────────────

import { C } from "../../theme/colors";

export function Badge({ lbl, col = C.brand, sm = false, variant = "solid", children, className = "" }) {
  const content = children ?? lbl;
  const solid = variant === "solid";

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: solid ? `${col}12` : "#fff",
        color: col,
        border: `1px solid ${solid ? `${col}26` : C.border}`,
        padding: sm ? "3px 8px" : "4px 10px",
        borderRadius: 999,
        fontSize: sm ? 11 : 12,
        fontWeight: 700,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
        lineHeight: 1.3,
        boxShadow: solid ? "inset 0 1px 0 rgba(255,255,255,0.48)" : "none",
      }}
    >
      {content}
    </span>
  );
}
