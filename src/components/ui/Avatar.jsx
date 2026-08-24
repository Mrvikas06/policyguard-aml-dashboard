// ─────────────────────────────────────────────────────────────────────────────
// Avatar — minimal user avatar
// ─────────────────────────────────────────────────────────────────────────────

import { C } from "../../theme/colors";

export function Avatar({ name = "PG", style, className = "" }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={className}
      style={{
        width: 36,
        height: 36,
        borderRadius: 12,
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(180deg, #2563EB, #1D4ED8)",
        color: "#fff",
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: "0.02em",
        boxShadow: C.shadowSm,
        ...style,
      }}
    >
      {initials}
    </div>
  );
}
