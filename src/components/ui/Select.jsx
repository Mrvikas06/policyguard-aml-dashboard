// ─────────────────────────────────────────────────────────────────────────────
// Select — Premium dropdown with consistent styling
// ─────────────────────────────────────────────────────────────────────────────

import { cn } from "../../theme/colors";

export function Select({ error = false, disabled = false, style, className = "", children, ...props }) {
  return (
    <select
      {...props}
      disabled={disabled}
      className={cn("input-base", "select", className)}
      style={{
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        paddingRight: 36,
        borderColor: error ? "var(--color-critical)" : undefined,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {children}
    </select>
  );
}