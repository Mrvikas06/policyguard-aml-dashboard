// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — THREAT INTELLIGENCE AESTHETIC
// NSA War Room × Bloomberg Terminal
// ─────────────────────────────────────────────────────────────────────────────

export const C = {
  // Background layers (darkest → lightest surface)
  void:      "#01040a",
  abyss:     "#020712",
  deep:      "#040e1e",
  surface:   "#060f20",
  card:      "#070d1c",
  cardHi:    "#0a1428",
  // Borders
  rim:       "#0c1e38",
  rimHi:     "#152c50",
  ghost:     "#162038",
  // Accent palette
  amber:     "#f59e0b",
  amberDim:  "#f59e0b18",
  amberGlow: "#f59e0b40",
  red:       "#ff3333",
  redDim:    "#ff333318",
  orange:    "#ff6b00",
  orangeDim: "#ff6b0018",
  teal:      "#00d4c8",
  tealDim:   "#00d4c812",
  // Text
  white:     "#f0f6ff",
  mist:      "#8aa4bf",
  fog:       "#3a5878",
  // Utility
  glow: (col, str = 30) => `0 0 ${str}px ${col}40, 0 0 ${str * 2}px ${col}15`,
};

// Severity → visual properties
export const SEVER = {
  critical: { col: C.red,    dim: C.redDim,    lbl: "CRITICAL", dot: "#ff3333" },
  high:     { col: C.orange, dim: C.orangeDim, lbl: "HIGH",     dot: "#ff6b00" },
  medium:   { col: C.amber,  dim: C.amberDim,  lbl: "MEDIUM",   dot: "#f59e0b" },
};

// Status → visual properties
export const STATUS = {
  open:      { col: "#ff3333", lbl: "OPEN" },
  reviewing: { col: "#ff6b00", lbl: "REVIEWING" },
  resolved:  { col: "#00d4c8", lbl: "RESOLVED" },
};

// Shared inline style factories
export const styleUtils = {
  inp: {
    background:  C.card,
    border:      `1px solid ${C.rim}`,
    color:       C.white,
    padding:     "7px 12px",
    borderRadius: 6,
    fontSize:    11,
    fontFamily:  "'JetBrains Mono', monospace",
    outline:     "none",
  },
  btn: (bg, tc = "#000") => ({
    background:     bg,
    color:          tc,
    border:         "none",
    padding:        "9px 20px",
    borderRadius:   7,
    fontWeight:     900,
    fontSize:       11,
    letterSpacing:  "0.06em",
    fontFamily:     "'JetBrains Mono', monospace",
    cursor:         "pointer",
  }),
  btnOutline: (col) => ({
    background:    "transparent",
    color:         col,
    border:        `1px solid ${col}40`,
    padding:       "9px 20px",
    borderRadius:  7,
    fontWeight:    700,
    fontSize:      11,
    fontFamily:    "'JetBrains Mono', monospace",
    cursor:        "pointer",
  }),
};

// Global CSS string (inject via <style> tag inside component)
export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700;800&family=Bebas+Neue&display=swap');

  @keyframes fadeUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn  { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes throb    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.5)} }
  @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes flicker  { 0%,98%,100%{opacity:1} 99%{opacity:.7} }
  @keyframes blink    { 0%,49%{opacity:1} 50%,100%{opacity:0} }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  ::-webkit-scrollbar            { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track      { background: #01040a; }
  ::-webkit-scrollbar-thumb      { background: #0c1e38; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover{ background: #152c50; }

  button, select { font-family: 'JetBrains Mono', monospace; cursor: pointer; }

  .card-hover { transition: all .2s; }
  .card-hover:hover {
    border-color: #00d4c840 !important;
    box-shadow: 0 0 24px #00d4c808 !important;
  }
  .row-hover { transition: all .15s; }
  .row-hover:hover {
    background: #070d1c !important;
    border-color: #152c50 !important;
  }
`;
