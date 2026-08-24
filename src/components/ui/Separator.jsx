// ─────────────────────────────────────────────────────────────────────────────
// Separator — Premium divider with variants
// ─────────────────────────────────────────────────────────────────────────────

import { C, cn } from "../../theme/colors";

export function Separator({
  vertical = false,
  variant = "default",
  style,
  className = "",
  children,
  ...props
}) {
  const variants = {
    default: {
      background: vertical
        ? `linear-gradient(180deg, transparent, ${C.border}, transparent)`
        : `linear-gradient(90deg, transparent, ${C.border}, transparent)`,
    },
    subtle: {
      background: vertical
        ? `linear-gradient(180deg, transparent, ${C.border}40, transparent)`
        : `linear-gradient(90deg, transparent, ${C.border}40, transparent)`,
    },
    strong: {
      background: vertical
        ? C.border
        : C.border,
    },
    gradient: {
      background: vertical
        ? `linear-gradient(180deg, transparent, ${C.brand}, transparent)`
        : `linear-gradient(90deg, transparent, ${C.brand}, transparent)`,
    },
    dashed: {
      background: "none",
      borderStyle: "dashed",
      borderWidth: vertical ? "0 0 0 1px" : "1px 0 0 0",
      borderColor: C.border,
    },
  };

  const v = variants[variant] || variants.default;

  const baseStyle = {
    width: vertical ? 1 : "100%",
    height: vertical ? "100%" : 1,
    flexShrink: 0,
    ...v,
    ...style,
  };

  if (children) {
    return (
      <div
        {...props}
        className={cn("separator-with-text", className)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          color: C.textMuted,
          fontSize: 11.5,
          fontWeight: 600,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          ...style,
        }}
      >
        <div style={{ flex: 1, ...baseStyle }} />
        <span style={{ whiteSpace: "nowrap" }}>{children}</span>
        <div style={{ flex: 1, ...baseStyle }} />
      </div>
    );
  }

  return <div {...props} className={cn("separator", className)} style={baseStyle} />;
}