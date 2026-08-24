// ─────────────────────────────────────────────────────────────────────────────
// Button — Premium action control with full variant support
// ─────────────────────────────────────────────────────────────────────────────

import { C, styleUtils, cn } from "../../theme/colors";

const base = styleUtils.btnBase;

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  disabled = false,
  style,
  className = "",
  type = "button",
  children,
  onClick,
  ...props
}) {
  const sizes = {
    sm: { padding: "7px 12px", fontSize: 12, borderRadius: C.radiusSm, gap: 6 },
    md: { padding: "10px 16px", fontSize: 13, borderRadius: C.radius, gap: 8 },
    lg: { padding: "13px 20px", fontSize: 14, borderRadius: C.radiusLg, gap: 10 },
  };

  const variantStyles = {
    primary: styleUtils.btnPrimary(disabled || loading),
    secondary: styleUtils.btnSecondary(disabled || loading),
    outline: styleUtils.btnOutline(C.brand, disabled || loading),
    ghost: styleUtils.btnGhost(C.textDim, disabled || loading),
    danger: styleUtils.btnDanger(disabled || loading),
    accent: styleUtils.btnPrimary(disabled || loading), // reuse primary with accent color via style override
  };

  const variantStyle = variantStyles[variant] || variantStyles.primary;

  // Override accent color if variant is accent
  const finalStyle = variant === "accent" 
    ? { ...variantStyle, background: disabled || loading ? `${C.accent}66` : C.accent, borderColor: disabled || loading ? "transparent" : C.accent }
    : variantStyle;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn("btn", className)}
      style={{
        ...base,
        ...sizes[size],
        ...finalStyle,
        width: block ? "100%" : "auto",
        ...style,
      }}
      {...props}
    >
      {loading && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" fill="none" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
}