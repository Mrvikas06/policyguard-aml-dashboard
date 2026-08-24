// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — POLICYGUARD AML INTELLIGENCE — MODERN PROFESSIONAL THEME
// ─────────────────────────────────────────────────────────────────────────────

export const C = {
  // Core neutrals - deep navy base for professional financial UI
  bg:           "#0B1220",        // Deep navy background
  bgElevated:   "#111A2E",        // Card/surface background
  bgHover:      "#16213E",        // Hover states
  surface:      "#141E3A",        // Primary surface
  surfaceAlt:   "#1A2742",        // Secondary surface
  border:       "#233251",        // Default borders
  borderLight:  "#2D3E5E",        // Lighter borders
  borderFocus:  "#3B82F6",        // Focus ring

  // Text hierarchy
  text:         "#F1F5F9",        // Primary text (slate-50)
  textDim:      "#94A3B8",        // Secondary text (slate-400)
  textMuted:    "#64748B",        // Muted text (slate-500)
  textInverse:  "#0B1220",        // Text on colored backgrounds

  // Brand - Professional blue with teal accent
  brand:        "#2563EB",        // Primary blue-600
  brandLight:   "#3B82F6",        // Blue-500
  brandDark:    "#1D4ED8",        // Blue-700
  brandGlow:    "#2563EB33",      // Glow/shadow
  brandSoft:    "#2563EB1A",      // Subtle backgrounds

  // Accent - Teal for financial/trust feel
  accent:       "#0D9488",        // Teal-600
  accentLight:  "#14B8A6",        // Teal-500
  accentDark:   "#0F766E",        // Teal-700
  accentGlow:   "#0D948833",
  accentSoft:   "#0D94881A",

  // Semantic colors - Refined for financial context
  critical:     "#DC2626",        // Red-600 (not pink)
  criticalSoft: "#DC26261A",
  criticalGlow: "#DC262633",
  high:         "#EA580C",        // Orange-600
  highSoft:     "#EA580C1A",
  highGlow:     "#EA580C33",
  medium:       "#CA8A04",        // Yellow-600
  mediumSoft:   "#CA8A041A",
  mediumGlow:   "#CA8A0433",
  low:          "#16A34A",        // Green-600
  lowSoft:      "#16A34A1A",
  lowGlow:      "#16A34A33",
  resolved:     "#059669",        // Emerald-600
  resolvedSoft: "#0596691A",
  resolvedGlow: "#05966933",

  // AI/Intelligence indicator
  ai:           "#7C3AED",        // Violet-600
  aiSoft:       "#7C3AED1A",
  aiGlow:       "#7C3AED33",

  // Shadows - Layered depth
  shadowXs:     "0 1px 2px rgba(0,0,0,0.3)",
  shadowSm:     "0 2px 8px rgba(0,0,0,0.35)",
  shadow:       "0 8px 24px rgba(0,0,0,0.4)",
  shadowLg:     "0 16px 48px rgba(0,0,0,0.45)",
  shadowXl:     "0 24px 64px rgba(0,0,0,0.5)",

  // Radius
  radiusSm:     "6px",
  radius:       "10px",
  radiusLg:     "14px",
  radiusXl:     "18px",
  radiusFull:   "9999px",

  // Transitions
  fast:         "120ms ease",
  normal:       "180ms ease",
  slow:         "240ms ease",

  // Z-index scale
  zBase:        1,
  zDropdown:    100,
  zSticky:      200,
  zModal:       400,
  zPopover:     500,
  zToast:       600,
  zTooltip:     700,

  // Breakpoints
  bpSm:         "640px",
  bpMd:         "768px",
  bpLg:         "1024px",
  bpXl:       "1280px",
  bp2xl:      "1536px",
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

// Shared style utilities
export const styleUtils = {
  // Glass card effect
  glass: (elevated = false) => ({
    background: elevated ? "linear-gradient(180deg, rgba(20,30,58,0.95) 0%, rgba(17,26,46,0.98) 100%)"
                         : "linear-gradient(180deg, rgba(17,26,46,0.92) 0%, rgba(11,18,32,0.96) 100%)",
    border: `1px solid ${C.border}`,
    borderRadius: C.radiusLg,
    boxShadow: elevated ? C.shadow : C.shadowSm,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
  }),

  // Input base
  input: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    color: C.text,
    padding: "10px 12px",
    borderRadius: C.radius,
    fontSize: 13.5,
    fontFamily: "'Inter', system-ui, sans-serif",
    outline: "none",
    transition: `border-color ${C.fast}, box-shadow ${C.fast}, background ${C.fast}`,
    width: "100%",
    minWidth: 0,
    "&:hover": { borderColor: C.borderLight },
    "&:focus": {
      borderColor: C.brand,
      boxShadow: `0 0 0 3px ${C.brandGlow}`,
    },
    "&::placeholder": { color: C.textMuted, opacity: 0.7 },
  },

  // Button variants
  btnBase: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: C.radius,
    border: "1px solid transparent",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.01em",
    lineHeight: 1,
    padding: "10px 16px",
    transition: `transform ${C.fast}, box-shadow ${C.fast}, background ${C.fast}, border-color ${C.fast}, color ${C.fast}`,
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  btnPrimary: (disabled = false) => ({
    background: disabled ? `${C.brand}66` : C.brand,
    color: "#fff",
    borderColor: disabled ? "transparent" : C.brand,
    boxShadow: disabled ? "none" : C.shadowSm,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
  }),

  btnSecondary: (disabled = false) => ({
    background: disabled ? `${C.surfaceAlt}80` : C.surfaceAlt,
    color: disabled ? C.textMuted : C.text,
    borderColor: disabled ? C.border : C.border,
    boxShadow: disabled ? "none" : C.shadowSm,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
  }),

  btnOutline: (color = C.brand, disabled = false) => ({
    background: "transparent",
    color: disabled ? `${color}80` : color,
    borderColor: disabled ? `${color}66` : color,
    boxShadow: "none",
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
  }),

  btnGhost: (color = C.brand, disabled = false) => ({
    background: "transparent",
    color: disabled ? `${color}80` : color,
    borderColor: "transparent",
    boxShadow: "none",
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
  }),

  btnDanger: (disabled = false) => ({
    background: disabled ? `${C.critical}66` : C.critical,
    color: "#fff",
    borderColor: disabled ? "transparent" : C.critical,
    boxShadow: disabled ? "none" : C.shadowSm,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
  }),

  // Badge
  badge: (color = C.brand, size = "md", variant = "solid") => {
    const padding = size === "sm" ? "3px 8px" : size === "lg" ? "5px 12px" : "4px 10px";
    const fontSize = size === "sm" ? 11 : size === "lg" ? 13 : 12;
    if (variant === "solid") {
      return {
        display: "inline-flex", alignItems: "center", gap: 5,
        background: `${color}1A`, color: color,
        border: `1px solid ${color}33`,
        padding, borderRadius: C.radiusFull,
        fontSize, fontWeight: 700, letterSpacing: "0.01em",
        lineHeight: 1.3, whiteSpace: "nowrap",
      };
    }
    return {
      display: "inline-flex", alignItems: "center", gap: 5,
      background: "transparent", color: color,
      border: `1px solid ${color}40`,
      padding, borderRadius: C.radiusFull,
      fontSize, fontWeight: 600, letterSpacing: "0.01em",
      lineHeight: 1.3, whiteSpace: "nowrap",
    };
  },

  // Progress bar
  progress: (color = C.brand, height = 8) => ({
    width: "100%", height,
    background: C.surfaceAlt,
    borderRadius: C.radiusFull,
    overflow: "hidden",
    border: `1px solid ${C.border}`,
  }),

  progressFill: (color = C.brand) => ({
    height: "100%",
    background: `linear-gradient(90deg, ${color} ${color})`,
    borderRadius: C.radiusFull,
    transition: "width 0.3s ease-out",
  }),

  // Table row
  tableRow: {
    transition: `background ${C.fast}, transform ${C.fast}`,
  },

  // Scrollbar
  scrollbar: {
    "&::-webkit-scrollbar": { width: 8, height: 8 },
    "&::-webkit-scrollbar-track": { background: C.bg },
    "&::-webkit-scrollbar-thumb": { background: C.border, borderRadius: C.radiusFull, border: `2px solid ${C.bg}` },
    "&::-webkit-scrollbar-thumb:hover": { background: C.borderLight },
  },
};

// Global CSS injection
export const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

* { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 14px; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
body {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: ${C.bg};
  color: ${C.text};
  min-height: 100vh;
  line-height: 1.5;
}

#root { min-height: 100vh; }

/* Selection */
::selection { background: ${C.brandGlow}; color: ${C.text}; }

/* Focus visible */
*:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px ${C.brandGlow};
  border-radius: ${C.radiusSm};
}

/* Scrollbar global */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: ${C.bg}; }
::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: ${C.radiusFull}; border: 2px solid ${C.bg}; }
::-webkit-scrollbar-thumb:hover { background: ${C.borderLight}; }

/* Input/Select base */
input, select, textarea, button { font-family: inherit; }
input[type="search"]::-webkit-search-cancel-button { -webkit-appearance: none; height: 16px; width: 16px; }

/* Selection dropdown */
select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 36px; }

/* Animations */
.animate-fadeIn { animation: fadeIn ${C.normal} forwards; }
.animate-slideUp { animation: slideUp ${C.normal} forwards; }
.animate-slideDown { animation: slideDown ${C.normal} forwards; }
.animate-scaleIn { animation: scaleIn ${C.fast} forwards; }

/* Layout utilities */
.app-shell { min-height: 100vh; background: ${C.bg}; }
.page-frame { width: min(100%, 1680px); margin: 0 auto; }
.sidebar-shell { background: ${C.bgElevated}; border-right: 1px solid ${C.border}; }
.topbar-shell { background: rgba(17,26,46,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid ${C.border}; position: sticky; top: 0; z-index: ${C.zSticky}; }

/* Nav items */
.nav-item { display: flex; align-items: center; gap: 10px; width: 100%; border: none; background: transparent; color: ${C.textDim}; padding: 10px 12px; border-radius: ${C.radius}; text-align: left; transition: all ${C.fast}; font-size: 13.5px; font-weight: 500; cursor: pointer; }
.nav-item:hover { background: ${C.brandSoft}; color: ${C.brand}; }
.nav-item-active { background: ${C.brandSoft}; color: ${C.brand}; border-left: 3px solid ${C.brand}; }

/* Mobile */
.mobile-only { display: none !important; }
@media (max-width: 1024px) { .mobile-only { display: inline-flex !important; } .desktop-sidebar { display: none; } }

/* Table */
.data-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.data-table th { text-align: left; padding: 11px 12px; font-size: 11.5px; color: ${C.textMuted}; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; border-bottom: 1px solid ${C.border}; white-space: nowrap; }
.data-table td { padding: 13px 12px; font-size: 13px; color: ${C.text}; border-bottom: 1px solid ${C.border}; vertical-align: middle; }
.data-table tbody tr { transition: background ${C.fast}; }
.data-table tbody tr:hover { background: ${C.bgHover}; }
.data-table tbody tr.clickable { cursor: pointer; }
.data-table tbody tr.clickable:hover { transform: translateX(2px); }

/* Badge variants */
.badge-critical { background: ${C.criticalSoft}; color: ${C.critical}; border: 1px solid ${C.critical}40; }
.badge-high { background: ${C.highSoft}; color: ${C.high}; border: 1px solid ${C.high}40; }
.badge-medium { background: ${C.mediumSoft}; color: ${C.medium}; border: 1px solid ${C.medium}40; }
.badge-low { background: ${C.lowSoft}; color: ${C.low}; border: 1px solid ${C.low}40; }
.badge-resolved { background: ${C.resolvedSoft}; color: ${C.resolved}; border: 1px solid ${C.resolved}40; }
.badge-ai { background: ${C.aiSoft}; color: ${C.ai}; border: 1px solid ${C.ai}40; }
.badge-brand { background: ${C.brandSoft}; color: ${C.brand}; border: 1px solid ${C.brand}40; }
.badge-outline { background: transparent; border: 1px solid ${C.border}; color: ${C.textDim}; }

/* Button base */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: ${C.radius}; font-weight: 600; font-size: 13px; letter-spacing: 0.01em; padding: 10px 16px; transition: all ${C.fast}; cursor: pointer; border: 1px solid transparent; white-space: nowrap; font-family: inherit; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
.btn-primary { background: ${C.brand}; color: #fff; border-color: ${C.brand}; box-shadow: ${C.shadowSm}; }
.btn-primary:hover:not(:disabled) { background: ${C.brandDark}; box-shadow: ${C.shadow}; transform: translateY(-1px); }
.btn-primary:active:not(:disabled) { transform: translateY(0); }
.btn-secondary { background: ${C.surfaceAlt}; color: ${C.text}; border-color: ${C.border}; box-shadow: ${C.shadowSm}; }
.btn-secondary:hover:not(:disabled) { background: ${C.bgHover}; border-color: ${C.borderLight}; }
.btn-outline { background: transparent; color: ${C.brand}; border-color: ${C.brand}; }
.btn-outline:hover:not(:disabled) { background: ${C.brandSoft}; }
.btn-ghost { background: transparent; color: ${C.textDim}; border-color: transparent; }
.btn-ghost:hover:not(:disabled) { background: ${C.surfaceAlt}; color: ${C.text}; }
.btn-danger { background: ${C.critical}; color: #fff; border-color: ${C.critical}; box-shadow: ${C.shadowSm}; }
.btn-danger:hover:not(:disabled) { background: #B91C1C; box-shadow: ${C.shadow}; }

/* Input styles */
.input { width: 100%; min-width: 0; background: ${C.surface}; border: 1px solid ${C.border}; color: ${C.text}; padding: 10px 12px; font-size: 13.5px; border-radius: ${C.radius}; outline: none; transition: all ${C.fast}; font-family: inherit; }
.input:hover { border-color: ${C.borderLight}; }
.input:focus { border-color: ${C.brand}; box-shadow: 0 0 0 3px ${C.brandGlow}; }
.input::placeholder { color: ${C.textMuted}; opacity: 0.7; }
.input-error { border-color: ${C.critical}; }
.input-error:focus { box-shadow: 0 0 0 3px ${C.criticalGlow}; }

/* Select */
.select { appearance: none; width: 100%; min-width: 0; background: ${C.surface}; border: 1px solid ${C.border}; color: ${C.text}; padding: 10px 36px 10px 12px; font-size: 13.5px; border-radius: ${C.radius}; outline: none; transition: all ${C.fast}; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; }
.select:hover { border-color: ${C.borderLight}; }
.select:focus { border-color: ${C.brand}; box-shadow: 0 0 0 3px ${C.brandGlow}; }

/* Progress */
.progress { width: 100%; background: ${C.surfaceAlt}; border-radius: ${C.radiusFull}; overflow: hidden; border: 1px solid ${C.border}; }
.progress-fill { height: 100%; border-radius: ${C.radiusFull}; transition: width 0.3s ease-out; }

/* Card */
.card { background: ${C.bgElevated}; border: 1px solid ${C.border}; border-radius: ${C.radiusLg}; box-shadow: ${C.shadowSm}; overflow: clip; transition: all ${C.normal}; }
.card:hover { border-color: ${C.borderLight}; box-shadow: ${C.shadow}; }
.card-elevated { background: ${C.surface}; box-shadow: ${C.shadow}; }

/* Tooltip */
.tooltip { position: relative; }
.tooltip::before { content: attr(data-tooltip); position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); padding: 6px 10px; background: ${C.text}; color: ${C.bg}; font-size: 11.5px; font-weight: 500; border-radius: ${C.radius}; white-space: nowrap; opacity: 0; visibility: hidden; transition: all ${C.fast}; z-index: ${C.zTooltip}; margin-bottom: 6px; }
.tooltip:hover::before { opacity: 1; visibility: visible; }

/* Skeleton loading */
.skeleton { background: linear-gradient(90deg, ${C.surfaceAlt} 25%, ${C.bgHover} 50%, ${C.surfaceAlt} 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: ${C.radius}; }
`;

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