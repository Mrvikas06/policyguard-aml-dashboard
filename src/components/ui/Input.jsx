// ─────────────────────────────────────────────────────────────────────────────
// Input — Premium form field with full state support
// ─────────────────────────────────────────────────────────────────────────────

import { C, styleUtils, cn } from "../../theme/colors";

export function Input({
  error = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  className = "",
  ...props
}) {
  const isFocused = props.onFocus || props.onBlur;
  
  return (
    <div style={{ position: "relative", width: "100%", minWidth: 0, display: "flex", alignItems: "center" }}>
      {leftIcon && (
        <span style={{ position: "absolute", left: 12, color: C.textMuted, pointerEvents: "none", zIndex: 1 }}>
          {leftIcon}
        </span>
      )}
      <input
        {...props}
        disabled={disabled}
        className={cn("input", className)}
        style={{
          ...styleUtils.input,
          background: disabled ? C.surfaceAlt : C.surface,
          color: disabled ? C.textMuted : C.text,
          borderColor: error ? C.critical : undefined,
          boxShadow: error ? `0 0 0 1px ${C.critical}` : undefined,
          paddingLeft: leftIcon ? 40 : undefined,
          paddingRight: rightIcon ? 40 : undefined,
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? "not-allowed" : "text",
          ...style,
        }}
        onFocus={(e) => {
          if (!disabled) e.target.style.boxShadow = `0 0 0 3px ${error ? C.criticalGlow : C.brandGlow}`;
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.target.style.boxShadow = "none";
          props.onBlur?.(e);
        }}
      />
      {rightIcon && (
        <span style={{ position: "absolute", right: 12, color: C.textMuted, pointerEvents: "none", zIndex: 1 }}>
          {rightIcon}
        </span>
      )}
    </div>
  );
}