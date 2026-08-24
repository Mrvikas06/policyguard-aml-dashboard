// ─────────────────────────────────────────────────────────────────────────────
// Button — premium enterprise action control
// ─────────────────────────────────────────────────────────────────────────────

import { C } from "../../theme/colors";

const base = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  borderRadius: 10,
  border: "1px solid transparent",
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: "0.01em",
  lineHeight: 1,
  padding: "10px 14px",
  transition: "transform .16s ease, box-shadow .16s ease, background .16s ease, border-color .16s ease, color .16s ease",
  boxShadow: C.shadowSm,
  cursor: "pointer",
  userSelect: "none",
  whiteSpace: "nowrap",
};

const variants = {
  default: (col) => ({
    background: `linear-gradient(135deg, ${col.start}, ${col.end})`,
    color: col.text || "#fff",
    borderColor: `${col.start}88`,
    boxShadow: `0 10px 24px ${col.start}1A`,
  }),
  secondary: () => ({
    background: "linear-gradient(180deg, #fff, #f8fafc)",
    color: C.text,
    borderColor: C.border,
  }),
  outline: (col) => ({
    background: "#fff",
    color: col.text || col.start,
    borderColor: C.border,
  }),
  ghost: (col) => ({
    background: "transparent",
    color: col.text || col.start,
    borderColor: "transparent",
    boxShadow: "none",
  }),
};

export function Button({
  variant = "default",
  tone = "teal",
  size = "md",
  block = false,
  style,
  className = "",
  type = "button",
  children,
  ...props
}) {
  const palette = {
    teal: { start: C.brand, end: C.brandHover, text: "#fff" },
    amber: { start: C.high, end: C.high, text: "#fff" },
    red: { start: C.critical, end: C.critical, text: "#fff" },
    slate: { start: C.panelAlt, end: C.text2, text: C.text },
    blue: { start: C.ai, end: C.ai, text: "#fff" },
    sky: { start: C.sky, end: C.ai, text: "#fff" },
    violet: { start: C.violet, end: "#6D28D9", text: "#fff" },
    rose: { start: C.rose, end: "#E11D48", text: "#fff" },
    mint: { start: C.mint, end: "#14B8A6", text: "#fff" },
  }[tone] || { start: C.brand, end: C.brandHover, text: "#fff" };

  const sizes = {
    sm: { padding: "8px 12px", fontSize: 12, borderRadius: 10 },
    md: { padding: "10px 14px", fontSize: 13, borderRadius: 10 },
    lg: { padding: "12px 16px", fontSize: 14, borderRadius: 12 },
  };

  return (
    <button
      type={type}
      {...props}
      className={`pg-button ${className}`.trim()}
      data-variant={variant}
      data-tone={tone}
      style={{
        ...base,
        ...sizes[size],
        ...variants[variant](palette),
        width: block ? "100%" : "auto",
        ...(style || {}),
      }}
    >
      {children}
    </button>
  );
}
