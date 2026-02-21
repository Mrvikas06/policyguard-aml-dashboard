import { C } from "../theme/colors";
import { Badge } from "../components/ui/Badge";
import { LayerGraph } from "../components/canvas/LayerGraph";
import { VIOLATIONS, HIGH_RISK_PAIRS } from "../data/violations";

export function NetworkView() {
  return (
    <div style={{ padding: "24px 28px", animation: "fadeUp .4s ease" }}>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: "0.1em", marginBottom: 4 }}>
        TRANSACTION <span style={{ color: C.amber }}>NETWORK</span>
      </div>
      <div style={{ fontSize: 10, color: C.fog, marginBottom: 20 }}>
        Layering · Circular Transfer · Fan-out Detection · IBM AML Dataset
      </div>

      {/* ── Graph Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {[
          { txn: "TXN-34421", rule: "R-013 Layering",  amt: "$75,000",  viol: VIOLATIONS[3], col: C.red,    desc: "$75,000 passed through 4 intermediate shell accounts before reaching final destination. Classic layering — funds separated from illegal origin." },
          { txn: "TXN-55119", rule: "R-014 Circular",  amt: "$15,000",  viol: VIOLATIONS[9], col: C.orange, desc: "$15,000 returned to originating account ACC-2211 within 36 hours after passing through 2 intermediaries — circular layering pattern." },
        ].map(n => (
          <div key={n.txn} className="card-hover" style={{ background: C.card, border: `1px solid ${n.col}25`, borderRadius: 12, padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.white }}>{n.txn}</div>
                <div style={{ fontSize: 10, color: n.col, marginTop: 2 }}>{n.rule} · {n.amt}</div>
              </div>
              <Badge lbl="CRITICAL" col={C.red} />
            </div>
            <div style={{ height: 148 }}><LayerGraph violation={n.viol} /></div>
            <div style={{ marginTop: 10, fontSize: 10, color: C.fog, lineHeight: 1.7, borderTop: `1px solid ${C.rim}`, paddingTop: 8 }}>{n.desc}</div>
          </div>
        ))}
      </div>

      {/* ── High-Risk Account Pairs Table ── */}
      <div className="card-hover" style={{ background: C.card, border: `1px solid ${C.rim}`, borderRadius: 12, padding: "20px 24px" }}>
        <div style={{ fontSize: 9, color: C.fog, letterSpacing: "0.12em", marginBottom: 14 }}>◈ HIGH-RISK ACCOUNT PAIRS — IBM AML</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.rim}` }}>
              {["From Account","To Account","Total Amount","Txn Count","Pattern","Rule","Risk"].map(h => (
                <th key={h} style={{ padding: "7px 10px", textAlign: "left", color: C.fog, fontSize: 9, letterSpacing: "0.08em" }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HIGH_RISK_PAIRS.map((row, i) => (
              <tr key={i} className="row-hover" style={{ borderBottom: `1px solid ${C.rim}15` }}>
                <td style={{ padding: "9px 10px", color: C.teal,  fontWeight: 700 }}>{row[0]}</td>
                <td style={{ padding: "9px 10px", color: C.teal,  fontWeight: 700 }}>{row[1]}</td>
                <td style={{ padding: "9px 10px", color: C.amber, fontWeight: 900 }}>{row[2]}</td>
                <td style={{ padding: "9px 10px", color: C.mist  }}>{row[3]}</td>
                <td style={{ padding: "9px 10px", color: C.mist  }}>{row[4]}</td>
                <td style={{ padding: "9px 10px" }}><Badge lbl={row[5]} col={C.teal} sm /></td>
                <td style={{ padding: "9px 10px" }}><Badge lbl={row[6]} col={row[6] === "CRITICAL" ? C.red : C.orange} sm /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
