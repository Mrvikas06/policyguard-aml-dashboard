import { C, STATUS, styleUtils } from "../theme/colors";
import { Badge } from "../components/ui/Badge";
import { VIOLATIONS } from "../data/violations";

const { btn, btnOutline } = styleUtils;

export function ReportsView({ viols, score, scoreCol, crit, conf, resol, notify }) {
  const ctrRequired = VIOLATIONS.filter(v => ["R-001","R-018"].includes(v.rule)).length;

  return (
    <div style={{ padding: "24px 28px", animation: "fadeUp .4s ease" }}>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: "0.1em", marginBottom: 4 }}>
        COMPLIANCE <span style={{ color: C.amber }}>REPORTS</span>
      </div>
      <div style={{ fontSize: 10, color: C.fog, marginBottom: 20 }}>
        SAR · CTR · FinCEN filings · audit trail · IBM AML dataset
      </div>

      {/* ── Summary KPIs ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 18 }}>
        {[
          { l: "AML Score",     v: `${score}%`, col: scoreCol },
          { l: "SAR Required",  v: crit,         col: C.red    },
          { l: "CTR Required",  v: ctrRequired,  col: C.orange },
          { l: "AML Confirmed", v: conf,          col: C.red    },
          { l: "Resolved",      v: resol,         col: C.teal   },
        ].map(s => (
          <div key={s.l} className="card-hover" style={{ background: C.card, border: `1px solid ${s.col}22`, borderRadius: 10, padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: 8, color: C.fog, letterSpacing: "0.12em", marginBottom: 8 }}>{s.l.toUpperCase()}</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: s.col, lineHeight: 1 }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* ── Filing Tracker Table ── */}
      <div className="card-hover" style={{ background: C.card, border: `1px solid ${C.rim}`, borderRadius: 12, padding: "20px 24px", marginBottom: 14 }}>
        <div style={{ fontSize: 9, color: C.fog, letterSpacing: "0.12em", marginBottom: 14 }}>◈ SAR / CTR FILING TRACKER — ALL VIOLATIONS</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.rim}` }}>
              {["ID","Rule","Transaction","From → To","Amount","Type","Filing","Status"].map(h => (
                <th key={h} style={{ padding: "7px 10px", textAlign: "left", color: C.fog, fontSize: 9, letterSpacing: "0.07em" }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {viols.map(v => (
              <tr key={v.id} className="row-hover" style={{ borderBottom: `1px solid ${C.rim}15` }}>
                <td style={{ padding: "8px 10px", color: C.teal,  fontWeight: 700 }}>{v.id}</td>
                <td style={{ padding: "8px 10px", color: C.mist  }}>{v.rule}</td>
                <td style={{ padding: "8px 10px", color: C.fog   }}>{v.txn}</td>
                <td style={{ padding: "8px 10px", color: C.fog,   fontSize: 9 }}>{v.from.slice(-6)} → {v.to.slice(-6)}</td>
                <td style={{ padding: "8px 10px", color: C.amber, fontWeight: 900 }}>${v.amount.toLocaleString()}</td>
                <td style={{ padding: "8px 10px" }}><Badge lbl={v.type} col={C.teal} sm /></td>
                <td style={{ padding: "8px 10px" }}><Badge lbl={v.severity === "critical" ? "SAR/CTR" : "Review"} col={v.severity === "critical" ? C.red : C.orange} sm /></td>
                <td style={{ padding: "8px 10px" }}><Badge lbl={STATUS[v.status].lbl} col={STATUS[v.status].col} sm /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Action Buttons ── */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => notify("aml_compliance_report_feb2026.pdf generated ✓", C.teal)} style={btn(`linear-gradient(135deg,${C.teal},#00a090)`)}>⬇  EXPORT SAR REPORT</button>
        <button onClick={() => notify("aml_violations.json exported ✓", C.amber)}              style={btnOutline(C.amber)}>{"{ }"}  EXPORT JSON</button>
        <button onClick={() => notify("FinCEN CTR batch submitted ✓", C.orange)}               style={btnOutline(C.orange)}>📋  FILE CTR BATCH</button>
        <button onClick={() => notify("Audit log emailed to compliance@intellium.in", C.teal)} style={btnOutline(C.teal)}>✉  EMAIL AUDIT LOG</button>
      </div>
    </div>
  );
}
