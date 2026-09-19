// ─────────────────────────────────────────────────────────────────────────────
// BrandMark — PolicyGuard AI logo mark
// ─────────────────────────────────────────────────────────────────────────────

import { C } from "../../theme/colors";

export function BrandMark({ size = 34 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" style={{ filter: "drop-shadow(0 0 14px rgba(6, 182, 212, 0.45))" }}>
      <defs>
        <linearGradient id="pg-brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>
      <path d="M32 6 L52 15 V32 C52 44 42 52 32 58 C22 52 12 44 12 32 V15 Z" fill="rgba(6, 182, 212, 0.12)" stroke="url(#pg-brand-grad)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M32 26 L22 36 M32 26 L42 36 M22 36 L42 36" stroke="rgba(56, 189, 248, 0.75)" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="32" cy="24" r="5" fill="url(#pg-brand-grad)" />
      <circle cx="22" cy="36" r="4" fill="#38BDF8" />
      <circle cx="42" cy="36" r="4" fill="#10B981" />
      <circle cx="32" cy="24" r="2" fill="#ffffff" />
    </svg>
  );
}