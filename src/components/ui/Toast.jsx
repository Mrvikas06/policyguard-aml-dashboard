// ─────────────────────────────────────────────────────────────────────────────
// Toast — Slide-in notification for actions (resolve, SAR file, export, etc.)
// ─────────────────────────────────────────────────────────────────────────────

import { C } from "../../theme/colors";

export function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div
      style={{
        position:       "fixed",
        top:            18,
        right:          22,
        zIndex:         9999,
        background:     C.card,
        border:         `1px solid ${toast.col}50`,
        borderRadius:   8,
        padding:        "11px 18px",
        color:          toast.col,
        fontSize:       11,
        fontWeight:     700,
        animation:      "slideIn .3s ease",
        backdropFilter: "blur(16px)",
        boxShadow:      `0 0 32px ${toast.col}20`,
        fontFamily:     "'JetBrains Mono', monospace",
      }}
    >
      {toast.msg}
    </div>
  );
}
