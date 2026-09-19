// ─────────────────────────────────────────────────────────────────────────────
// Badge — Premium status pill with semantic variants
// ─────────────────────────────────────────────────────────────────────────────

import { cn, riskColor } from "../../theme/colors";

const SEVERITY_MAP = {
  critical: "var(--color-critical)",
  high: "var(--color-high)",
  medium: "var(--color-medium)",
  low: "var(--color-low)",
  resolved: "var(--color-resolved)",
  open: "var(--color-critical)",
  investigating: "var(--color-ai)",
  reviewing: "var(--color-high)",
  escalated: "var(--color-medium)",
  awaiting_review: "var(--color-accent)",
  false_positive: "var(--color-text-muted)",
  new: "var(--color-brand)",
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
  if (severity) badgeColor = SEVERITY_MAP[severity] || "var(--color-brand)";
  else if (status) badgeColor = SEVERITY_MAP[status] || "var(--color-brand)";
  else if (riskScore !== undefined) badgeColor = riskColor(riskScore);
  else if (!badgeColor) badgeColor = "var(--color-brand)";

  const sizes = {
    xs: { padding: "2px 8px", fontSize: 10, gap: 4, dotSize: 4 },
    sm: { padding: "4px 10px", fontSize: 11, gap: 6, dotSize: 6 },
    md: { padding: "6px 12px", fontSize: 12, gap: 6, dotSize: 6 },
    lg: { padding: "8px 16px", fontSize: 13, gap: 8, dotSize: 8 },
  };

  const { padding, fontSize, gap, dotSize } = sizes[size];

  // For dynamic background opacity, we can rely on standard CSS variables if they were rgb,
  // but since they are hex, we'll use a hack or assume badgeColor might be a variable.
  // Actually, for simplicity, we can just apply opacity or use a standard background class.
  // Since we accept arbitrary hex/vars, we'll use inline styles for the custom color part.

  const isVar = badgeColor.startsWith("var(");
  // Simple check for raw hex vs var to apply opacity
  // In a real app we might predefine all badge classes, but here we keep the dynamic logic.

  return (
    <span
      {...props}
      className={cn("badge-base", className)}
      style={{
        padding,
        fontSize,
        gap,
        background: variant === "ghost" || variant === "outline" ? "transparent" : badgeColor,
        color: variant === "solid" ? "#fff" : badgeColor,
        border: variant === "outline" ? `1px solid ${badgeColor}` : "1px solid transparent",
        opacity: variant === "soft" ? 0.9 : 1,
        // Hack for soft background using box-shadow inset or similar could be done, 
        // but for now, we'll just set background opacity if it's 'soft'.
        ...(variant === "soft" && {
          background: `color-mix(in srgb, ${badgeColor} 20%, transparent)`,
          color: badgeColor,
          borderColor: `color-mix(in srgb, ${badgeColor} 30%, transparent)`,
        }),
        ...style,
      }}
    >
      {dot && <span style={{ width: dotSize, height: dotSize, borderRadius: "50%", background: "currentColor", flexShrink: 0 }} />}
      {content}
    </span>
  );
}