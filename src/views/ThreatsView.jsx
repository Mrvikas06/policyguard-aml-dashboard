import { C, SEVER, STATUS, styleUtils } from "../theme/colors";
import { Badge } from "../components/ui/Badge";

const { inp, btn, btnOutline } = styleUtils;

export function ThreatsView({ viols, setViols, expanded, setExpanded, sevF, setSevF, stF, setStF, open, resol, conf, notify }) {
  const reviewing = viols.filter(v => v.status === "reviewing").length;

  const filtered = viols.filter(v =>
    (sevF === "all" || v.severity === sevF) &&
    (stF  === "all" || v.status   === stF)
  );

  const resolve = (id, st) => {
    setViols(vs => vs.map(v => v.id === id ? { ...v, status: st } : v));
    notify(
      st === "resolved" ? `✓ ${id} resolved — audit entry created` : `${id} escalated to senior review`,
      st === "resolved" ? C.teal : C.orange
    );
  };

  return (
    <div style={{ padding: "24px 28px", animation: "fadeUp .4s ease" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: "0.1em" }}>
            AML THREAT <span style={{ color: C.red }}>REGISTRY</span>
          </div>
          <div style={{ fontSize: 10, color: C.fog, marginTop: 3 }}>
            {open} open · {reviewing} reviewing · {resol} resolved · {conf} IBM-confirmed
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { v: sevF, s: setSevF, opts: ["all","critical","high","medium"], lbl: "Severity" },
            { v: stF,  s: setStF,  opts: ["all","open","reviewing","resolved"], lbl: "Status" },
          ].map(sel => (
            <select key={sel.lbl} value={sel.v} onChange={e => sel.s(e.target.value)} style={{ ...inp, minWidth: 130 }}>
              {sel.opts.map(o => (
                <option key={o} value={o}>{o === "all" ? `All ${sel.lbl}` : o.charAt(0).toUpperCase() + o.slice(1)}</option>
              ))}
            </select>
          ))}
        </div>
      </div>

      {/* ── Violation Cards ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {filtered.map(v => {
          const isExp = expanded === v.id;
          const sv    = SEVER[v.severity];
          return (
            <div key={v.id} style={{ background: C.card, border: `1px solid ${isExp ? sv.col + "50" : C.rim}`, borderLeft: `3px solid ${sv.col}`, borderRadius: 10, overflow: "hidden", transition: "all .2s", boxShadow: isExp ? `0 0 28px ${sv.col}10` : "none" }}>

              {/* Row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 18px", cursor: "pointer" }} onClick={() => setExpanded(isExp ? null : v.id)}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: sv.col, boxShadow: `0 0 8px ${sv.col}`, animation: "throb 3s ease-in-out infinite", display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: C.fog, minWidth: 46 }}>{v.id}</span>
                <span style={{ fontSize: 10, color: C.teal, fontWeight: 700, minWidth: 44 }}>{v.rule}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#dde8f8", fontWeight: 600, marginBottom: 2 }}>{v.evidence}</div>
                  <div style={{ fontSize: 9, color: C.fog }}>{v.txn} · {v.from} → {v.to} · {v.type} · {v.route}</div>
                </div>
                <span style={{ fontSize: 11, color: C.amber, fontWeight: 900 }}>${v.amount.toLocaleString()}</span>
                <Badge lbl={v.category}  col={C.teal}                sm />
                <Badge lbl={sv.lbl}      col={sv.col}                sm />
                <Badge lbl={STATUS[v.status].lbl} col={STATUS[v.status].col} sm />
                {v.confirmed && <Badge lbl="AML✓" col="#22c55e" sm />}
                <span style={{ fontSize: 9, color: C.fog, minWidth: 42, textAlign: "right" }}>{v.time}</span>
                <span style={{ color: C.fog, marginLeft: 4 }}>{isExp ? "▲" : "▼"}</span>
              </div>

              {/* Expanded Detail */}
              {isExp && (
                <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${C.rim}`, paddingTop: 16, animation: "fadeUp .25s ease" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 12 }}>
                    {[
                      { t: "VIOLATION EVIDENCE",       v: v.evidence,                                         col: sv.col   },
                      { t: "TRANSACTION ID",            v: `${v.txn}\n${v.from}\n→ ${v.to}`,                  col: C.teal   },
                      { t: "AMOUNT · TYPE · ROUTE",    v: `$${v.amount.toLocaleString()}\n${v.type} · ${v.route}`, col: C.amber },
                      { t: "CONFIDENCE · GROUND TRUTH",v: `${(v.confidence * 100).toFixed(0)}% confidence\n${v.confirmed ? "is_laundering = 1 ✓" : "is_laundering = 0"}`, col: v.confidence > 0.9 ? C.red : C.orange },
                    ].map(c => (
                      <div key={c.t} style={{ background: C.surface, borderRadius: 8, padding: "11px 13px", border: `1px solid ${C.rim}` }}>
                        <div style={{ fontSize: 8, color: C.fog, letterSpacing: "0.12em", marginBottom: 6 }}>{c.t}</div>
                        <div style={{ fontSize: 11, color: c.col, fontWeight: 700, whiteSpace: "pre-line", lineHeight: 1.5 }}>{c.v}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: C.surface, border: `1px solid ${C.rim}`, borderRadius: 8, padding: "11px 13px", marginBottom: 12 }}>
                    <div style={{ fontSize: 8, color: C.fog, letterSpacing: "0.12em", marginBottom: 5 }}>◈ POLICY RULE VIOLATED</div>
                    <div style={{ fontSize: 11, color: C.mist, lineHeight: 1.5, marginBottom: 4 }}>{v.ruleText}</div>
                    <div style={{ fontSize: 8, color: C.fog, letterSpacing: "0.12em", marginBottom: 5, marginTop: 10 }}>◈ AI-GENERATED REMEDIATION</div>
                    <div style={{ fontSize: 11, color: C.mist, lineHeight: 1.5 }}>{v.remediation}</div>
                  </div>

                  {v.status !== "resolved" ? (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button onClick={() => resolve(v.id, "resolved")}  style={btn(`linear-gradient(135deg,${C.teal},#00a090)`)}>✓ RESOLVE</button>
                      <button onClick={() => resolve(v.id, "reviewing")} style={btnOutline(C.orange)}>👁 ESCALATE</button>
                      <button onClick={() => notify(`SAR filed for ${v.txn} — FinCEN notified`, C.red)}   style={btnOutline(C.red)}>📋 FILE SAR</button>
                      <button onClick={() => notify(`CTR queued for ${v.txn}`, C.amber)} style={btnOutline(C.amber)}>📄 QUEUE CTR</button>
                    </div>
                  ) : (
                    <div style={{ color: "#22c55e", fontSize: 11, fontWeight: 700 }}>✓ Resolved — immutable audit entry logged</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
