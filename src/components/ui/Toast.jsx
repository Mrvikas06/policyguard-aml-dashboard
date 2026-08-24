// ─────────────────────────────────────────────────────────────────────────────
// Toast — Slide-in notification with auto-dismiss and actions
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { C, cn } from "../../theme/colors";

export function Toast({ toast, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) { 
      setVisible(false); 
      return; 
    }
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast || !visible) return null;

  const colors = {
    info: C.brand,
    success: C.resolved,
    warning: C.high,
    error: C.critical,
    default: C.text,
  };

  const color = colors[toast.type] || toast.color || colors.default;

  return (
    <div
      className={cn("toast", toast.className)}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: C.zToast,
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        minWidth: 280,
        maxWidth: 420,
        padding: "14px 16px",
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderLeft: `4px solid ${color}`,
        borderRadius: C.radiusLg,
        boxShadow: C.shadowLg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        animation: "slideIn 0.3s ease",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
      onMouseEnter={() => { /* pause timer could be added */ }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <div style={{ color: C.text, fontWeight: 600, fontSize: 13.5, marginBottom: 2 }}>
            {toast.title}
          </div>
        )}
        <div style={{ color: C.textDim, fontSize: 13, lineHeight: 1.5 }}>
          {toast.message ?? toast.msg}
        </div>
      </div>
      {toast.action && (
        <Button variant="ghost" size="sm" onClick={() => { toast.action.onClick?.(); onClose?.(); }}>
          {toast.action.label}
        </Button>
      )}
      <button
        onClick={() => { setVisible(false); onClose?.(); }}
        style={{
          background: "none",
          border: "none",
          color: C.textMuted,
          cursor: "pointer",
          padding: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: C.radiusSm,
          transition: `all ${C.fast}`,
          flexShrink: 0,
        }}
        onMouseOver={(e) => e.currentTarget.style.color = C.text}
        onMouseOut={(e) => e.currentTarget.style.color = C.textMuted}
        aria-label="Dismiss"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}

export function ToastContainer({ toasts = [], onClose }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: C.zToast, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" }}>
      {toasts.map((toast, i) => (
        <div key={i} style={{ pointerEvents: "auto" }}>
          <Toast toast={toast} onClose={() => onClose(i)} />
        </div>
      ))}
    </div>
  );
}