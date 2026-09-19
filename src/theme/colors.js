// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — POLICYGUARD AML INTELLIGENCE — MODERN PROFESSIONAL THEME
// ─────────────────────────────────────────────────────────────────────────────

// Mapping back to CSS variables so existing components that reference C.color still work
// during the transition, or for inline charts/SVGs that need raw hex values.
export const C = {
  // Core neutrals - deep navy base for professional financial UI
  bg:           "var(--color-bg)",
  bgElevated:   "var(--color-bg-elevated)",
  bgHover:      "var(--color-bg-hover)",
  surface:      "var(--color-surface)",
  surfaceAlt:   "var(--color-surface-alt)",
  border:       "var(--color-border)",
  borderLight:  "var(--color-border-light)",
  borderFocus:  "var(--color-border-focus)",

  // Text hierarchy
  text:         "var(--color-text)",
  textDim:      "var(--color-text-dim)",
  textMuted:    "var(--color-text-muted)",
  textInverse:  "var(--color-text-inverse)",

  // Brand - Professional blue with teal accent
  brand:        "var(--color-brand)",
  brandLight:   "var(--color-brand-light)",
  brandDark:    "var(--color-brand-dark)",
  brandGlow:    "var(--color-brand-glow)",
  brandSoft:    "var(--color-brand-soft)",

  // Accent - Teal for financial/trust feel
  accent:       "var(--color-accent)",
  accentLight:  "var(--color-accent-light)",
  accentDark:   "var(--color-accent-dark)",
  accentGlow:   "var(--color-accent-glow)",
  accentSoft:   "var(--color-accent-soft)",

  // Semantic colors - Refined for financial context
  critical:     "var(--color-critical)",
  criticalSoft: "var(--color-critical-soft)",
  criticalGlow: "var(--color-critical-glow)",
  high:         "var(--color-high)",
  highSoft:     "var(--color-high-soft)",
  highGlow:     "var(--color-high-glow)",
  medium:       "var(--color-medium)",
  mediumSoft:   "var(--color-medium-soft)",
  mediumGlow:   "var(--color-medium-glow)",
  low:          "var(--color-low)",
  lowSoft:      "var(--color-low-soft)",
  lowGlow:      "var(--color-low-glow)",
  resolved:     "var(--color-resolved)",
  resolvedSoft: "var(--color-resolved-soft)",
  resolvedGlow: "var(--color-resolved-glow)",

  // AI/Intelligence indicator
  ai:           "var(--color-ai)",
  aiSoft:       "var(--color-ai-soft)",
  aiGlow:       "var(--color-ai-glow)",

  // Shadows
  shadowXs:     "var(--shadow-sm)",
  shadowSm:     "var(--shadow-sm)",
  shadow:       "var(--shadow-md)",
  shadowLg:     "var(--shadow-lg)",
  shadowXl:     "var(--shadow-lg)",

  // Radius
  radiusSm:     "var(--radius-sm)",
  radius:       "var(--radius-md)",
  radiusLg:     "var(--radius-lg)",
  radiusXl:     "var(--radius-xl)",
  radiusFull:   "var(--radius-full)",

  // Z-index scale
  zBase:        1,
  zDropdown:    100,
  zSticky:      200,
  zModal:       400,
  zPopover:     500,
  zToast:       600,
  zTooltip:     700,
};

// Severity mapping
export const SEVER = {
  critical: { col: C.critical, soft: C.criticalSoft, glow: C.criticalGlow, lbl: "Critical", dot: C.critical },
  high:     { col: C.high,     soft: C.highSoft,     glow: C.highGlow,     lbl: "High",     dot: C.high },
  medium:   { col: C.medium,   soft: C.mediumSoft,   glow: C.mediumGlow,   lbl: "Medium",   dot: C.medium },
  low:      { col: C.low,      soft: C.lowSoft,      glow: C.lowGlow,      lbl: "Low",      dot: C.low },
};

// Status mapping
export const STATUS = {
  open:              { col: C.critical, soft: C.criticalSoft, lbl: "Open" },
  investigating:     { col: C.ai,       soft: C.aiSoft,       lbl: "Investigating" },
  reviewing:         { col: C.high,     soft: C.highSoft,     lbl: "Reviewing" },
  escalated:         { col: C.medium,   soft: C.mediumSoft,   lbl: "Escalated" },
  awaiting_review:   { col: C.accent,   soft: C.accentSoft,   lbl: "Awaiting Review" },
  resolved:          { col: C.resolved, soft: C.resolvedSoft, lbl: "Resolved" },
  false_positive:    { col: C.textMuted, soft: "rgba(100,116,139,0.1)", lbl: "False Positive" },
  new:               { col: C.brand,    soft: C.brandSoft,    lbl: "New" },
};

// Risk score color function (higher = worse)
export const riskColor = (score) => {
  if (score >= 70) return C.critical;
  if (score >= 50) return C.high;
  if (score >= 30) return C.medium;
  return C.resolved;
};

export const riskLabel = (score) => {
  if (score >= 70) return "Critical";
  if (score >= 50) return "High Risk";
  if (score >= 30) return "Elevated";
  return "Low Risk";
};

// GLOBAL_CSS is now empty as we use index.css
export const GLOBAL_CSS = ``;

// Utility functions
export const cn = (...classes) => classes.filter(Boolean).join(" ");

export const formatNumber = (n, opts = {}) => new Intl.NumberFormat("en-US", opts).format(n);
export const formatCurrency = (n, currency = "USD") => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
export const formatDate = (ts) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
export const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
export const formatRelative = (ts) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};