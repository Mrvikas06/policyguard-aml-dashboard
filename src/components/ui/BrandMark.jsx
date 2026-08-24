// ─────────────────────────────────────────────────────────────────────────────
// BrandMark — PolicyGuard AI logo mark
// ─────────────────────────────────────────────────────────────────────────────

import { C } from "../../theme/colors";

export function BrandMark({ size = 34 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id="pg-brand" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={C.brand} />
          <stop offset="100%" stopColor={C.accent} />
        </linearGradient>
      </defs>
      <path d="M20 12h18c8.8 0 16 7.2 16 16s-7.2 16-16 16H30v8H20V12zm10 10v12h7.5c3.3 0 6-2.7 6-6s-2.7-6-6-6H30z" fill="url(#pg-brand)" />
      <path d="M32 8 49 16v16c0 10.8-8 18-17 24-9-6-17-13.2-17-24V16l17-8z" fill="none" stroke="url(#pg-brand)" strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="22" cy="26" r="2.2" fill="#fff" opacity="0.95" />
      <circle cx="42" cy="20" r="2.2" fill="#fff" opacity="0.95" />
      <circle cx="45" cy="42" r="2.2" fill="#fff" opacity="0.95" />
    </svg>
  );
}