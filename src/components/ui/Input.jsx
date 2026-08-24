// ─────────────────────────────────────────────────────────────────────────────
// Input — refined search and form field primitive
// ─────────────────────────────────────────────────────────────────────────────

import { C } from "../../theme/colors";

export function Input({ style, className = "", ...props }) {
  return (
    <input
      {...props}
      className={`shad-input ${className}`.trim()}
      style={{
        width: "100%",
        minWidth: 0,
        padding: "11px 12px",
        fontSize: 13,
        color: C.text,
        ...style,
      }}
    />
  );
}
