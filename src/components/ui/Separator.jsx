// ─────────────────────────────────────────────────────────────────────────────
// Separator — lightweight divider for card and page sections
// ─────────────────────────────────────────────────────────────────────────────

import { C } from "../../theme/colors";

export function Separator({ style, vertical = false, className = "", ...props }) {
  return (
    <div
      {...props}
      className={className}
      style={{
        background: vertical ? `linear-gradient(180deg, transparent, ${C.border}, transparent)` : `linear-gradient(90deg, transparent, ${C.border}, transparent)`,
        width: vertical ? 1 : "100%",
        height: vertical ? "100%" : 1,
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
