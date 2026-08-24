// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — POLICYGUARD LIGHT ENTERPRISE SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

export const C = {
  bg:        "#F4F7FB",
  surface:   "#FAFAFC",
  elevated:  "#F5F7FF",
  panel:     "#FAFAFC",
  panelAlt:  "#EEF3FA",
  border:    "#D8E2EF",
  borderHi:  "#B6C7DA",
  text:      "#0F1A2B",
  text2:     "#5B6E86",
  muted:     "#8A99AD",
  brand:     "#2563EB",
  brandHover:"#1D4ED8",
  sky:       "#38BDF8",
  violet:    "#7C3AED",
  rose:      "#F43F5E",
  amberSoft: "#F59E0B",
  mint:      "#10B981",
  ai:        "#06B6D4",
  critical:  "#E11D48",
  high:      "#F97316",
  medium:    "#EAB308",
  resolved:  "#22C55E",
  info:      "#2563EB",
  tealDim:   "#2563EB14",
  blueDim:   "#0EA5E914",
  redDim:    "#E11D4814",
  orangeDim: "#F9731614",
  amberDim:  "#EAB30814",
  greenDim:  "#22C55E14",
  ring:      "0 10px 30px rgba(15, 23, 42, 0.06)",
  shadowSm:  "0 1px 2px rgba(15, 23, 42, 0.05)",
  shadow:    "0 10px 30px rgba(15, 23, 42, 0.08)",
  shadowLg:  "0 18px 50px rgba(15, 23, 42, 0.10)",
  glow: (col, str = 20) => `0 0 ${str}px ${col}16`,
};

// Severity → visual properties
export const SEVER = {
  critical: { col: C.critical, dim: C.redDim,    lbl: "Critical", dot: C.critical },
  high:     { col: C.high,     dim: C.orangeDim, lbl: "High",     dot: C.high },
  medium:   { col: C.medium,   dim: C.amberDim,  lbl: "Medium",   dot: C.medium },
  low:      { col: C.resolved, dim: C.greenDim,  lbl: "Low",      dot: C.resolved },
};

// Status → visual properties
export const STATUS = {
  open:      { col: C.critical, lbl: "Open" },
  investigating: { col: C.ai,   lbl: "Investigating" },
  reviewing: { col: C.high,     lbl: "Reviewing" },
  escalated: { col: C.medium,   lbl: "Escalated" },
  awaiting:  { col: C.ai,       lbl: "Awaiting Review" },
  resolved:  { col: C.resolved, lbl: "Resolved" },
  false_positive: { col: C.muted, lbl: "False Positive" },
};

// Shared inline style factories
export const styleUtils = {
  inp: {
    background:  C.surface,
    border:      `1px solid ${C.border}`,
    color:       C.text,
    padding:     "11px 12px",
    borderRadius: 10,
    fontSize:    13,
    fontFamily:  "'Inter', system-ui, sans-serif",
    outline:     "none",
    boxShadow:   C.shadowSm,
  },
  btn: (bg, tc = "#000") => ({
    background:     bg,
    color:          tc,
    border:         "none",
    padding:        "10px 16px",
    borderRadius:   10,
    fontWeight:     700,
    fontSize:       13,
    letterSpacing:  "0.01em",
    fontFamily:     "'Inter', system-ui, sans-serif",
    cursor:         "pointer",
    boxShadow:      C.shadow,
  }),
  btnOutline: (col) => ({
    background:    C.surface,
    color:         col,
    border:        `1px solid ${C.border}`,
    padding:       "10px 16px",
    borderRadius:  10,
    fontWeight:    600,
    fontSize:      13,
    fontFamily:    "'Inter', system-ui, sans-serif",
    cursor:        "pointer",
    boxShadow:     C.shadowSm,
  }),
};

// Global CSS string (inject via <style> tag inside component)
export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Geist+Mono:wght@400;500;700&display=swap');

  @keyframes fadeUp   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn  { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
  @keyframes shimmer  { 0%{background-position:-180% 0} 100%{background-position:180% 0} }
  @keyframes pulseDot { 0%,100%{transform:scale(1);opacity:.75} 50%{transform:scale(1.18);opacity:1} }
  @keyframes popIn    { from{opacity:0;transform:translateY(10px) scale(.98)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes softGlow { 0%,100%{box-shadow:0 0 0 rgba(37,99,235,0)} 50%{box-shadow:0 0 0 6px rgba(37,99,235,0.06)} }
  @keyframes sweep    { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }

  html {
    scroll-behavior: smooth;
    background: ${C.bg};
  }

  body {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    min-height: 100vh;
    background: ${C.bg};
    color: ${C.text};
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  *, *::before, *::after { box-sizing: border-box; }

  button, select, input, textarea {
    transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease, background .16s ease, color .16s ease, opacity .16s ease;
  }

  button:focus-visible,
  select:focus-visible,
  input:focus-visible,
  textarea:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14);
  }

  ::selection { background: rgba(37, 99, 235, 0.18); color: ${C.text}; }

  ::-webkit-scrollbar            { width: 10px; height: 10px; }
  ::-webkit-scrollbar-track      { background: ${C.bg}; }
  ::-webkit-scrollbar-thumb      { background: #cbd5e1; border-radius: 999px; border: 2px solid ${C.bg}; }
  ::-webkit-scrollbar-thumb:hover{ background: #94a3b8; }

  button, select, input, textarea { font-family: 'Inter', system-ui, sans-serif; }
  button { cursor: pointer; }

  .app-shell {
    position: relative;
    min-height: 100vh;
    background:
      radial-gradient(1200px circle at 0% 0%, rgba(37,99,235,0.14), transparent 42%),
      radial-gradient(900px circle at 100% 0%, rgba(14,165,233,0.10), transparent 34%),
      radial-gradient(1000px circle at 100% 100%, rgba(124,58,237,0.08), transparent 38%),
      linear-gradient(180deg, #f9fbff 0%, #f4f7fb 100%);
    color: ${C.text};
  }

  .page-frame {
    position: relative;
    width: min(100%, 1600px);
    margin: 0 auto;
  }

  .sidebar-shell {
    background: linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(249,250,252,0.90) 100%);
    backdrop-filter: blur(16px);
    border-right: 1px solid ${C.border};
    box-shadow: ${C.shadowSm};
  }

  .topbar-shell {
    background: linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.88) 100%);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid ${C.border};
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    border: 1px solid transparent;
    border-radius: 10px;
    background: transparent;
    color: ${C.text2};
    padding: 10px 12px;
    text-align: left;
    transition: background .15s ease, color .15s ease, border-color .15s ease, transform .15s ease;
    position: relative;
    overflow: hidden;
  }

  .nav-item:hover {
    background: rgba(37,99,235,0.05);
    color: ${C.text};
    transform: translateX(1px);
  }

  .nav-item-active {
    background: rgba(37,99,235,0.10);
    color: ${C.brand};
    border-color: rgba(37,99,235,0.18);
    box-shadow: inset 3px 0 0 ${C.brand}, 0 8px 20px rgba(37,99,235,0.05);
  }

.soft-card {
    background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,247,255,0.95) 100%);
    border: 1px solid ${C.border};
    border-radius: 14px;
    box-shadow: ${C.shadowSm};
    transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
    position: relative;
    overflow: clip;
  }

  .soft-card-elevated {
    background: linear-gradient(180deg, rgba(255,255,255,0.99) 0%, rgba(240,243,255,0.98) 100%);
    border: 1px solid ${C.border};
    border-radius: 14px;
    box-shadow: ${C.shadow};
    transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
    position: relative;
    overflow: clip;
  }

  .metric-card {
    background: linear-gradient(180deg, rgba(255,255,255,0.99) 0%, rgba(248,250,255,0.96) 100%);
    border: 1px solid ${C.border};
    border-radius: 14px;
    box-shadow: ${C.shadowSm};
    transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
    position: relative;
    overflow: clip;
  }

  .metric-card:hover,
  .soft-card:hover,
  .soft-card-elevated:hover {
    border-color: ${C.borderHi};
    transform: translateY(-2px);
    box-shadow: ${C.shadowLg};
  }

  .table-row {
    transition: background .15s ease, transform .15s ease;
  }

  .table-row:hover {
    background: #f8fafc !important;
    transform: translateY(-1px);
  }

  .btn-soft {
    border: 1px solid ${C.border};
    background: ${C.surface};
    color: ${C.text};
    border-radius: 10px;
    padding: 10px 14px;
    box-shadow: ${C.shadowSm};
  }

  .btn-brand {
    border: 1px solid rgba(37, 99, 235, 0.18);
    background: ${C.brand};
    color: white;
    border-radius: 10px;
    padding: 10px 14px;
    box-shadow: 0 8px 24px rgba(37,99,235,0.18);
  }

  .btn-brand:hover {
    background: ${C.brandHover};
  }

  .pg-button {
    position: relative;
    transform: translateY(0);
    will-change: transform;
  }

  .pg-button:hover {
    transform: translateY(-1px);
  }

  .pg-button:active {
    transform: translateY(0);
  }

  .pg-button:disabled {
    opacity: 0.56;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }

  .pg-tab {
    position: relative;
    transform: translateY(0);
    will-change: transform;
  }

  .pg-tab:hover {
    transform: translateY(-1px);
  }

  .pg-tab[data-active="true"] {
    background: ${C.surface} !important;
    color: ${C.text} !important;
    border-color: ${C.borderHi} !important;
    box-shadow: ${C.shadowSm};
  }

  .glass-card {
    background: ${C.surface};
    border: 1px solid ${C.border};
    box-shadow: ${C.shadowSm};
  }

  .glass-card-strong {
    background: ${C.elevated};
    border: 1px solid ${C.border};
    box-shadow: ${C.shadow};
  }

  .surface-row {
    background: rgba(255,255,255,0.72);
    transition: transform .18s ease, background .18s ease, border-color .18s ease, box-shadow .18s ease;
  }

  .surface-row:hover {
    background: #fff !important;
    transform: translateY(-1px);
  }

  .card-hover { transition: all .2s; }
  .card-hover:hover {
    border-color: ${C.borderHi} !important;
    box-shadow: ${C.shadowLg} !important;
  }

  .soft-card::before,
  .soft-card-elevated::before,
  .metric-card::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 3px;
    background: linear-gradient(90deg, rgba(37,99,235,0.0), rgba(37,99,235,0.28), rgba(14,165,233,0.22), rgba(124,58,237,0.18), rgba(37,99,235,0.0));
    opacity: 0.8;
    pointer-events: none;
  }

  .soft-card,
  .soft-card-elevated,
  .metric-card {
    animation: popIn .38s ease both;
  }

  .stagger-grid > * {
    animation: popIn .42s ease both;
  }

  .stagger-grid > *:nth-child(2) { animation-delay: 50ms; }
  .stagger-grid > *:nth-child(3) { animation-delay: 100ms; }
  .stagger-grid > *:nth-child(4) { animation-delay: 150ms; }
  .stagger-grid > *:nth-child(5) { animation-delay: 200ms; }
  .stagger-grid > *:nth-child(6) { animation-delay: 250ms; }

  .row-hover { transition: all .15s; }
  .row-hover:hover {
    background: #f8fafc !important;
    border-color: ${C.borderHi} !important;
  }

  .shad-input,
  .shad-select,
  .shad-textarea {
    appearance: none;
    background: ${C.surface};
    color: ${C.text};
    border: 1px solid ${C.border};
    border-radius: 12px;
    outline: none;
    transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease;
  }

  .shad-input:focus,
  .shad-select:focus,
  .shad-textarea:focus {
    border-color: rgba(37, 99, 235, 0.55);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.10);
  }

  .text-mono { font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace; }

  .app-layout {
    grid-template-columns: 256px minmax(0, 1fr);
  }

  .mobile-only { display: none !important; }

  .mobile-nav {
    display: none;
  }

  .mobile-drawer-overlay {
    position: fixed;
    inset: 0;
    z-index: 70;
    background: rgba(15, 23, 42, 0.34);
    display: flex;
    justify-content: flex-start;
  }

  .mobile-drawer-panel {
    width: min(86vw, 320px);
    height: 100%;
    background: ${C.surface};
    box-shadow: ${C.shadowLg};
    border-right: 1px solid ${C.border};
    animation: slideIn .2s ease;
  }

  .kpi-grid {
    grid-template-columns: repeat(auto-fit, minmax(176px, 1fr));
  }

  .overview-split {
    grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  }

  .overview-duo {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  }

  .detail-split {
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.92fr);
  }

  .network-split {
    grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.8fr);
  }

  .case-split {
    grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  }

  .analysis-pairs {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .report-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .sentinel-grid {
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  }

  .filter-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .policy-row {
    grid-template-columns: minmax(108px, 128px) minmax(0, 1fr) minmax(96px, 120px) minmax(140px, 160px);
  }

  .graph-shell {
    min-height: 380px;
  }

  .graph-shell, .analytics-shell {
    overflow: hidden;
    animation: popIn .3s ease;
  }

  .page-stage {
    position: relative;
  }

  .page-stage.is-busy {
    opacity: 0.88;
  }

  .page-stage-loader {
    position: sticky;
    top: 0;
    z-index: 5;
    height: 3px;
    border-radius: 999px;
    overflow: hidden;
    background: rgba(148,163,184,0.16);
    margin-bottom: 14px;
  }

  .page-stage-loader::before {
    content: "";
    position: absolute;
    inset: 0;
    width: 38%;
    background: linear-gradient(90deg, rgba(37,99,235,0), ${C.brand}, ${C.sky}, ${C.violet}, rgba(37,99,235,0));
    animation: sweep 1.1s linear infinite;
  }

  .page-stage-body {
    transition: transform .24s ease, opacity .24s ease, filter .24s ease;
  }

  .page-stage.is-busy .page-stage-body {
    transform: translateY(6px) scale(0.996);
    opacity: 0.72;
    filter: saturate(0.92) blur(0.45px);
  }

  .profile-button {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    border: 1px solid ${C.border};
    background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.94));
    border-radius: 16px;
    padding: 10px 12px;
    box-shadow: ${C.shadowSm};
    cursor: pointer;
    min-width: 0;
  }

  .profile-button:hover {
    transform: translateY(-1px);
    border-color: ${C.borderHi};
    box-shadow: ${C.shadow};
  }

  .profile-button:focus-visible {
    box-shadow: 0 0 0 3px rgba(37,99,235,0.14), ${C.shadowSm};
  }

  .profile-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 90;
    background: rgba(15, 23, 42, 0.36);
    backdrop-filter: blur(12px);
    display: grid;
    place-items: center;
    padding: 18px;
  }

  .profile-modal-panel {
    width: min(100%, 760px);
    border-radius: 24px;
    background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96));
    border: 1px solid rgba(226,232,240,0.96);
    box-shadow: 0 30px 70px rgba(15,23,42,0.18);
    overflow: hidden;
    animation: popIn .22s ease both;
  }

  .profile-modal-head {
    padding: 22px 24px 16px;
    background: linear-gradient(135deg, rgba(37,99,235,0.10), rgba(14,165,233,0.08), rgba(124,58,237,0.08));
    border-bottom: 1px solid ${C.border};
  }

  .profile-modal-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(300px, 0.95fr);
    gap: 16px;
  }

  .profile-field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .permission-card {
    border: 1px solid ${C.border};
    background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96));
    border-radius: 18px;
    padding: 14px;
    display: grid;
    gap: 8px;
    cursor: pointer;
  }

  .permission-card:hover {
    border-color: ${C.borderHi};
    box-shadow: ${C.shadowSm};
    transform: translateY(-1px);
  }

  .permission-card[data-on="true"] {
    border-color: rgba(37,99,235,0.30);
    background: linear-gradient(180deg, rgba(37,99,235,0.08), rgba(255,255,255,0.98));
  }

  .skeleton-line {
    position: relative;
    overflow: hidden;
    background: linear-gradient(90deg, rgba(226,232,240,0.85) 0%, rgba(241,245,249,0.98) 50%, rgba(226,232,240,0.85) 100%);
    background-size: 220% 100%;
    animation: shimmer 1.3s linear infinite;
    border-radius: 999px;
  }

  @media (max-width: 1200px) {
    .metric-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    }

    .overview-split,
    .overview-duo,
    .detail-split,
    .network-split,
    .case-split {
      grid-template-columns: minmax(0, 1fr) !important;
    }

    .analysis-pairs {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
  }

  @media (max-width: 1024px) {
    .app-layout {
      grid-template-columns: minmax(0, 1fr);
    }

    .desktop-sidebar {
      display: none;
    }

    .mobile-only {
      display: inline-flex !important;
    }

    .mobile-nav {
      display: grid;
    }

    .filter-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }

    .report-grid,
    .sentinel-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }

    .policy-row {
      grid-template-columns: minmax(0, 1fr) !important;
    }

    .policy-actions {
      justify-content: flex-start !important;
    }
  }

  @media (max-width: 900px) {
    .page-frame {
      padding-inline: 12px !important;
    }
  }

  @media (max-width: 760px) {
    .metric-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }

    .analysis-pairs,
    .report-grid,
    .sentinel-grid,
    .filter-grid {
      grid-template-columns: minmax(0, 1fr) !important;
    }

    .mobile-nav {
      padding: 6px 6px 8px;
    }
  }

  @media (max-width: 560px) {
    .metric-grid {
      grid-template-columns: minmax(0, 1fr) !important;
    }

    .page-frame {
      padding-inline: 10px !important;
    }

    .mobile-nav {
      grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;
