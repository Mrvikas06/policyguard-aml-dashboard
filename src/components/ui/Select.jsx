// ─────────────────────────────────────────────────────────────────────────────
// Select — Premium dropdown with consistent styling
// ─────────────────────────────────────────────────────────────────────────────

import { C, styleUtils, cn } from "../../theme/colors";

export function Select({ error = false, disabled = false, style, className = "", children, ...props }) {
  return (
    <select
      {...props}
      disabled={disabled}
      className={cn("select", className)}
      style={{
        ...styleUtils.select,
        background: disabled ? C.surfaceAlt : C.surface,
        color: disabled ? C.textMuted : C.text,
        borderColor: error ? C.critical : undefined,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {children}
    </select>
  );
}