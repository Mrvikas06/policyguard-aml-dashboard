// ─────────────────────────────────────────────────────────────────────────────
// Input — Premium form field with full state support
// ─────────────────────────────────────────────────────────────────────────────

import { cn } from "../../theme/colors";

export function Input({
  error = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  className = "",
  ...props
}) {
  return (
    <div style={{ position: "relative", width: "100%", minWidth: 0, display: "flex", alignItems: "center" }}>
      {leftIcon && (
        <span style={{ position: "absolute", left: 12, color: "var(--color-text-muted)", pointerEvents: "none", zIndex: 1 }}>
          {leftIcon}
        </span>
      )}
      <input
        {...props}
        disabled={disabled}
        className={cn("input-base", className)}
        style={{
          borderColor: error ? "var(--color-critical)" : undefined,
          boxShadow: error ? `0 0 0 1px var(--color-critical)` : undefined,
          paddingLeft: leftIcon ? 40 : undefined,
          paddingRight: rightIcon ? 40 : undefined,
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? "not-allowed" : "text",
          ...style,
        }}
      />
      {rightIcon && (
        <span style={{ position: "absolute", right: 12, color: "var(--color-text-muted)", pointerEvents: "none", zIndex: 1 }}>
          {rightIcon}
        </span>
      )}
    </div>
  );
}