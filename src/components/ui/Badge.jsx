// ─────────────────────────────────────────────────────────────────────────────
// Badge — Premium status pill with semantic variants
// ─────────────────────────────────────────────────────────────────────────────

import { C, styleUtils, cn, riskColor, riskLabel } from "../../theme/colors";

const SEVERITY_MAP = {
  critical: C.critical,
  high: C.high,
  medium: C.medium,
  low: C.low,
  resolved: C.resolved,
  open: C.critical,
  investigating: C.ai,
  reviewing: C.high,
  escalated: C.medium,
  awaiting_review: C.accent,
  false_positive: C.textMuted,
  new: C.brand,
};

export function Badge({
  children,
  label,
  severity,
  status,
  riskScore,
  color,
  size = "md",
  variant = "solid",
  dot = false,
  className = "",
  style,
  ...props
}) {
  const content = children ?? label;
  
  // Determine color from semantic props
  let badgeColor = color;
  if (severity) badgeColor = SEVERITY_MAP[severity] || C.brand;
  else if (status) badgeColor = SEVERITY_MAP[status] || C.brand;
  else if (riskScore !== undefined) badgeColor = riskColor(riskScore);
  else if (!badgeColor) badgeColor = C.brand;

  const sizes = {
    xs: { padding: "2px 6px", fontSize: 10.5, gap: 4, dotSize: 5 },
    sm: { padding: "3px 8px", fontSize: 11, gap: 5, dotSize: 6 },
    md: { padding: "4px 10px", fontSize: 12, gap: 6, dotSize: 7 },
    lg: { padding: "5px 12px", fontSize: 13, gap: 7, dotSize: 8 },
  };

  const { padding, fontSize, gap, dotSize } = sizes[size];

  const variants = {
    solid: {
      background: `${badgeColor}1A`,
      color: badgeColor,
      border: `1px solid ${badgeColor}40`,
    },
    soft: {
      background: `${badgeColor}12`,
      color: badgeColor,
      border: `1px solid ${badgeColor}25`,
    },
    outline: {
      background: "transparent",
      color: badgeColor,
      border: `1px solid ${badgeColor}50`,
    },
    ghost: {
      background: "transparent",
      color: badgeColor,
      border: "none",
    },
  };

  const v = variants[variant] || variants.solid;

  return (
    <span
      {...props}
      className={cn("badge", className)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap,
        padding,
        borderRadius: C.radiusFull,
        fontSize,
        fontWeight: 700,
        letterSpacing: "0.01em",
        lineHeight: 1.3,
        whiteSpace: "nowrap",
        ...v,
        ...style,
      }}
    >
      {dot && <span style={{ width: dotSize, height: dotSize, borderRadius: "50%", background: badgeColor, flexShrink: 0 }} />}
      {content}
    </span>
  );
}