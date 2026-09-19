// ─────────────────────────────────────────────────────────────────────────────
// Button — Premium action control with full variant support
// ─────────────────────────────────────────────────────────────────────────────

import { cn } from "../../theme/colors";

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
  const sizeStyles = {
    sm: { padding: "8px 14px", fontSize: 12 },
    md: { padding: "10px 18px", fontSize: 13 },
    lg: { padding: "12px 22px", fontSize: 14 },
  };

  const variantClass = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-ghost", // Reusing ghost for now as outline doesn't have a specific glass class yet
    ghost: "btn-ghost",
    danger: "btn-danger",
    accent: "btn-primary", 
  }[variant] || "btn-primary";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn("btn", variantClass, className)}
      style={{
        ...sizeStyles[size],
        width: block ? "100%" : "auto",
        ...style,
      }}
      {...props}
    >
      {loading && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite", marginRight: 4 }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" fill="none" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
}