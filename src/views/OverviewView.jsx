import { C, SEVER } from "../theme/colors";
import { Donut } from "../components/ui/Donut";
import { CountUp } from "../components/ui/CountUp";
import { SparkBar } from "../components/ui/SparkBar";
import { Badge } from "../components/ui/Badge";
import { HexGrid } from "../components/canvas/HexGrid";
import { LayerGraph } from "../components/canvas/LayerGraph";
import { VIOLATIONS, MONTHLY_TREND } from "../data/violations";

export function OverviewView({ viols, score, scoreCol, open, crit, resol, conf, setView, setExpanded }) {
  const highCount = viols.filter(v => v.severity === "high").length;

  return (
    <div style={{ position: "relative", animation: "fadeUp .4s ease" }}>

      {/* ── Hero ── */}
      <div style={{ position: "relative", padding: "32px 28px 24px", overflow: "hidden", background: `linear-gradient(180deg,${C.deep} 0%,${C.void} 100%)`, borderBottom: `1px solid ${C.rim}` }}>
        <HexGrid />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 42, letterSpacing: "0.08em", lineHeight: 1, color: C.white, animation: "flicker 8s linear infinite" }}>
              AML THREAT <span style={{ color: C.amber }}>COMMAND</span>
            </div>
            <div style={{ fontSize: 11, color: C.mist, marginTop: 6 }}>IBM Transactions for Anti-Money Laundering · 487,312 records · BSA · FinCEN · FATF</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { v: crit,  col: C.red,   lbl: "CRITICAL" },
              { v: open,  col: C.amber, lbl: "OPEN"     },
              { v: resol, col: C.teal,  lbl: "RESOLVED" },
            ].map(s => (
              <div key={s.lbl} style={{ background: s.col + "18", border: `1px solid ${s.col}40`, borderRadius: 8, padding: "8px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: s.col, fontFamily: "'JetBrains Mono',monospace" }}>{s.v}</div>
                <div style={{ fontSize: 9, color: C.fog, letterSpacing: "0.1em" }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 28px" }}>

        {/* ── KPI Strip ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, marginBottom: 18 }}>
          {[
            { l: "Txns Scanned",     v: 487312,       col: C.teal,   bars: [120,150,210,180,240,190,230], sfx: "" },
            { l: "Total Violations", v: viols.length, col: C.red,    bars: [8,11,14,9,12,13,10],          sfx: "" },
            { l: "AML Confirmed",    v: conf,         col: C.red,    bars: [5,8,9,6,7,8,8],               sfx: "" },
            { l: "SAR Required",     v: crit,         col: C.orange, bars: [3,5,6,4,5,7,6],               sfx: "" },
            { l: "Recall Rate",      v: 80,           col: C.amber,  bars: [65,70,72,68,75,78,80],        sfx: "%" },
            { l: "Compliance Score", v: score,        col: scoreCol, bars: [55,60,62,58,65,70,score],     sfx: "%" },
          ].map((k, i) => (
            <div key={i} className="card-hover" style={{ background: C.card, border: `1px solid ${C.rim}`, borderRadius: 10, padding: "14px 15px", overflow: "hidden", cursor: "default" }}>
              <div style={{ fontSize: 8, color: C.fog, letterSpacing: "0.12em", marginBottom: 6 }}>{k.l.toUpperCase()}</div>
              <div style={{ fontSize: k.sfx ? 26 : 28, fontWeight: 900, color: k.col, lineHeight: 1, marginBottom: 6 }}>
                <CountUp to={k.v} sfx={k.sfx} />
              </div>
              <SparkBar data={k.bars} color={k.col} />
            </div>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 0.9fr", gap: 14, marginBottom: 14 }}>

          {/* Donut */}
          <div className="card-hover" style={{ background: C.card, border: `1px solid ${C.rim}`, borderRadius: 12, padding: "20px 22px" }}>
            <div style={{ fontSize: 9, color: C.fog, letterSpacing: "0.12em", marginBottom: 14 }}>◈ AML HEALTH SCORE</div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Donut pct={score} col={scoreCol} size={125} label="SCORE" />
              <div style={{ flex: 1 }}>
                {[[C.red, "Critical", crit],[C.orange, "High", highCount],[C.teal, "Resolved", resol],[C.amber, "AML Confirmed", conf]].map(([c, l, n]) => (
                  <div key={l} style={{ marginBottom: 9 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 10, color: C.mist }}>{l}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: c }}>{n}</span>
                    </div>
                    <div style={{ height: 3, background: C.ghost, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.round(n / Math.max(viols.length, 1) * 100)}%`, background: c, borderRadius: 3, transition: "width 1s ease", boxShadow: `0 0 6px ${c}` }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.rim}`, fontSize: 9, color: C.fog }}>
                  IBM AML recall: <span style={{ color: "#22c55e", fontWeight: 700 }}>80%</span> · Precision: <span style={{ color: "#22c55e", fontWeight: 700 }}>80%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly bar chart */}
          <div className="card-hover" style={{ background: C.card, border: `1px solid ${C.rim}`, borderRadius: 12, padding: "20px 22px" }}>
            <div style={{ fontSize: 9, color: C.fog, letterSpacing: "0.12em", marginBottom: 14 }}>◈ VIOLATIONS / MONTH</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 95 }}>
              {MONTHLY_TREND.map((d, i) => {
                const tot = d.c + d.h + d.med, max = 24, h = (tot / max) * 85;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: "100%", height: h, display: "flex", flexDirection: "column", borderRadius: "3px 3px 0 0", overflow: "hidden", transition: `height .9s ease ${i * 60}ms` }}>
                      <div style={{ flex: d.c,   background: C.red,    opacity: .85 }} />
                      <div style={{ flex: d.h,   background: C.orange, opacity: .85 }} />
                      <div style={{ flex: d.med, background: C.amber,  opacity: .85 }} />
                    </div>
                    <span style={{ fontSize: 7.5, color: C.fog }}>{d.m}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              {[[C.red,"Crit"],[C.orange,"High"],[C.amber,"Med"]].map(([c, l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 8, height: 8, background: c, borderRadius: 2 }} />
                  <span style={{ fontSize: 9, color: C.fog }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Layering network */}
          <div className="card-hover" style={{ background: C.card, border: `1px solid ${C.rim}`, borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: 9, color: C.fog, letterSpacing: "0.12em", marginBottom: 8 }}>◈ LAYERING · TXN-34421</div>
            <div style={{ height: 108 }}><LayerGraph violation={VIOLATIONS[3]} /></div>
            <div style={{ fontSize: 9, color: C.fog, marginTop: 8 }}>
              <span style={{ color: C.red, fontWeight: 700 }}>R-013</span> · $75,000 · 4-hop chain · <Badge lbl="CRITICAL" col={C.red} sm />
            </div>
          </div>
        </div>

        {/* ── Active Threats Strip ── */}
        <div className="card-hover" style={{ background: C.card, border: `1px solid ${C.rim}`, borderRadius: 12, padding: "18px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: C.fog, letterSpacing: "0.12em" }}>◈ ACTIVE THREATS</div>
            <button onClick={() => setView("threats")} style={{ background: "transparent", color: C.teal, border: `1px solid ${C.teal}30`, padding: "4px 12px", borderRadius: 5, fontSize: 9, fontWeight: 700 }}>VIEW ALL →</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {viols.filter(v => v.status === "open").slice(0, 5).map(v => (
              <div key={v.id} className="row-hover"
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: C.surface, borderRadius: 7, border: `1px solid ${C.rim}`, cursor: "pointer" }}
                onClick={() => { setView("threats"); setExpanded(v.id); }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: SEVER[v.severity].col, boxShadow: `0 0 7px ${SEVER[v.severity].col}`, flexShrink: 0, animation: "throb 3s ease-in-out infinite", display: "inline-block" }} />
                <span style={{ fontSize: 10, color: C.mist, fontWeight: 700, minWidth: 46 }}>{v.id}</span>
                <span style={{ fontSize: 10, color: C.teal, minWidth: 44 }}>{v.rule}</span>
                <span style={{ flex: 1, fontSize: 10, color: C.mist, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.evidence}</span>
                <span style={{ fontSize: 10, color: C.amber, fontWeight: 700 }}>${v.amount.toLocaleString()}</span>
                <span style={{ fontSize: 9, color: C.fog, minWidth: 42, textAlign: "right" }}>{v.time}</span>
                <Badge lbl={v.severity} col={SEVER[v.severity].col} sm />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
