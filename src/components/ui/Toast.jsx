// ─────────────────────────────────────────────────────────────────────────────
// Toast — Slide-in notification for actions (resolve, SAR file, export, etc.)
// ─────────────────────────────────────────────────────────────────────────────

import { C } from "../../theme/colors";

export function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position:       "fixed",
        bottom:         18,
        right:          22,
        zIndex:         9999,
        background:     "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.95))",
        border:         `1px solid ${toast.col}33`,
        borderLeft:     `4px solid ${toast.col}`,
        borderRadius:   16,
        padding:        "12px 16px",
        color:          toast.col,
        fontSize:       13,
        fontWeight:     700,
        animation:      "slideIn .28s ease",
        backdropFilter: "blur(12px)",
        boxShadow:      "0 18px 40px rgba(15, 23, 42, 0.14)",
        fontFamily:     "'Inter', system-ui, sans-serif",
      }}
    >
      {toast.msg}
    </div>
  );
}
