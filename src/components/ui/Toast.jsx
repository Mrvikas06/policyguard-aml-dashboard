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
        bottom:         18,
        right:          22,
        zIndex:         9999,
        background:     C.surface,
        border:         `1px solid ${C.border}`,
        borderRadius:   12,
        padding:        "12px 16px",
        color:          toast.col,
        fontSize:       13,
        fontWeight:     600,
        animation:      "slideIn .3s ease",
        backdropFilter: "blur(12px)",
        boxShadow:      C.shadowLg,
        fontFamily:     "'Inter', system-ui, sans-serif",
      }}
    >
      {toast.msg}
    </div>
  );
}
