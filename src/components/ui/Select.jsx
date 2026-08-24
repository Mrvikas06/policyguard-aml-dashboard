// ─────────────────────────────────────────────────────────────────────────────
// Select — refined select primitive
// ─────────────────────────────────────────────────────────────────────────────

import { C } from "../../theme/colors";

export function Select({ style, className = "", children, ...props }) {
  return (
    <select
      {...props}
      className={`shad-select ${className}`.trim()}
      style={{
        width: "100%",
        minWidth: 0,
        padding: "11px 36px 11px 12px",
        fontSize: 13,
        color: C.text,
        ...style,
      }}
    >
      {children}
    </select>
  );
}
