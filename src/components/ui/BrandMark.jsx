// ─────────────────────────────────────────────────────────────────────────────
// BrandMark — PolicyGuard AI logo mark
// ─────────────────────────────────────────────────────────────────────────────

import { C } from "../../theme/colors";

export function BrandMark({ size = 32 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <path 
        d="M16 2.5 L3.5 7.5 V15.5 C3.5 22.5 8.5 28.5 16 30.5 C23.5 28.5 28.5 22.5 28.5 15.5 V7.5 Z" 
        fill="none" 
        stroke={C.brand} 
        strokeWidth="2.5" 
        strokeLinejoin="round" 
      />
      <path 
        d="M16 2.5 L16 30.5" 
        stroke={C.brand} 
        strokeWidth="2.5" 
        opacity="0.25" 
      />
      <path 
        d="M9.5 16 L14 20.5 L22.5 12" 
        fill="none" 
        stroke={C.brand} 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}