import { useRef, useEffect } from "react";
import { C } from "../../theme/colors";
import { LIVE_TXNS } from "../../data/violations";

// ─────────────────────────────────────────────────────────────────────────────
// Ticker — Horizontally scrolling live transaction feed
// ─────────────────────────────────────────────────────────────────────────────
function Ticker({ items }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x = 0;
    const full = el.scrollWidth / 2;
    let raf;
    const step = () => {
      x += 0.6;
      if (x >= full) x = 0;
      el.style.transform = `translateX(-${x}px)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const doubled = [...items, ...items];

  return (
    <div style={{ overflow: "hidden", height: 28, display: "flex", alignItems: "center" }}>
      <div ref={ref} style={{ display: "flex", gap: 0, whiteSpace: "nowrap", willChange: "transform" }}>
        {doubled.map((item, i) => {
          const isAlert = item.includes("⚠");
          return (
            <span
              key={i}
              style={{
                fontSize:    10,
                color:       isAlert ? C.amber : C.fog,
                fontFamily:  "'JetBrains Mono', monospace",
                paddingRight: 40,
                letterSpacing: "0.03em",
              }}
            >
              {isAlert && <span style={{ color: C.red, marginRight: 4 }}>◈</span>}
              {item}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Topbar — Logo + nav tabs + status chips + live ticker row
// ─────────────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "overview",  lbl: "Overview"  },
  { id: "threats",   lbl: "Threats"   },
  { id: "policies",  lbl: "Policies"  },
  { id: "scanner",   lbl: "Scanner"   },
  { id: "network",   lbl: "Network"   },
  { id: "sentinel",  lbl: "Sentinel"  },
  { id: "reports",   lbl: "Reports"   },
];

export function Topbar({ view, setView, openCount, liveOn }) {
  return (
    <>
      {/* ── Main nav row ── */}
      <div
        style={{
          background:     C.abyss,
          borderBottom:   `1px solid ${C.rim}`,
          display:        "flex",
          alignItems:     "center",
          height:         48,
          paddingInline:  20,
          gap:            0,
          flexShrink:     0,
          position:       "relative",
          zIndex:         10,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          10,
            paddingRight: 20,
            borderRight:  `1px solid ${C.rim}`,
            marginRight:  16,
          }}
        >
          <div
            style={{
              width:        30,
              height:       30,
              borderRadius: 8,
              background:   `linear-gradient(135deg,${C.teal},#0090a0)`,
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              fontSize:     15,
              boxShadow:    C.glow(C.teal, 15),
            }}
          >
            🛡
          </div>
          <div>
            <div
              style={{
                fontFamily:    "'Bebas Neue', sans-serif",
                fontSize:      17,
                letterSpacing: "0.12em",
                color:         C.white,
                lineHeight:    1,
              }}
            >
              POLICYGUARD<span style={{ color: C.teal }}>·AI</span>
            </div>
            <div style={{ fontSize: 7.5, color: C.fog, letterSpacing: "0.15em" }}>
              AML THREAT INTELLIGENCE
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <div style={{ display: "flex", gap: 2, flex: 1 }}>
          {NAV_ITEMS.map((n) => (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              style={{
                background:    view === n.id ? `${C.teal}15` : "transparent",
                color:         view === n.id ? C.teal : C.fog,
                border:        "none",
                borderBottom:  `2px solid ${view === n.id ? C.teal : "transparent"}`,
                padding:       "0 14px",
                height:        47,
                fontSize:      11,
                fontWeight:    view === n.id ? 700 : 400,
                letterSpacing: "0.05em",
                display:       "flex",
                alignItems:    "center",
                gap:           5,
                transition:    "all .15s",
                position:      "relative",
              }}
            >
              {n.lbl}
              {n.id === "threats" && openCount > 0 && (
                <span
                  style={{
                    background:   C.red,
                    color:        "#fff",
                    borderRadius: 20,
                    padding:      "1px 5px",
                    fontSize:     9,
                    fontWeight:   900,
                  }}
                >
                  {openCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Status chips */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: liveOn ? C.teal : C.fog }}>
            <span
              style={{
                width:        7,
                height:       7,
                borderRadius: "50%",
                background:   liveOn ? C.teal : C.fog,
                display:      "inline-block",
                animation:    liveOn ? "throb 2s ease-in-out infinite" : "none",
              }}
            />
            CDC
          </div>
          <div style={{ width: 1, height: 20, background: C.rim }} />
          <div style={{ fontSize: 10, color: C.fog }}>
            IBM AML · <span style={{ color: C.teal }}>487K txns</span>
          </div>
        </div>
      </div>

      {/* ── Ticker row ── */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.rim}`, paddingInline: 20, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              fontSize:      9,
              color:         C.teal,
              fontWeight:    800,
              letterSpacing: "0.15em",
              whiteSpace:    "nowrap",
              borderRight:   `1px solid ${C.rim}`,
              paddingRight:  12,
              paddingBlock:  4,
            }}
          >
            LIVE TXN FEED
          </div>
          <Ticker items={LIVE_TXNS} />
        </div>
      </div>
    </>
  );
}
