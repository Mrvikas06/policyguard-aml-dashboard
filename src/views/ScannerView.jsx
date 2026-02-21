import { C, SEVER, styleUtils } from "../theme/colors";
import { Badge } from "../components/ui/Badge";

const { btn } = styleUtils;

const DB_TABLES = [
  { nm: "transactions",  rows: "487,312", v: 10, risk: "critical", fields: "Timestamp · From Account · To Account · Amount · Payment Format · is_laundering" },
  { nm: "accounts",      rows: "12,481",  v: 3,  risk: "high",     fields: "Account ID · Type · Open Date · Balance · Country" },
  { nm: "beneficiaries", rows: "8,220",   v: 2,  risk: "medium",   fields: "Beneficiary ID · Name · Bank · Country · Risk Score" },
];

export function ScannerView({ scanPhase, scanPct, scanLog, runScan }) {
  return (
    <div style={{ padding: "24px 28px", animation: "fadeUp .4s ease" }}>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: "0.1em", marginBottom: 4 }}>
        DATABASE <span style={{ color: C.teal }}>SCANNER</span>
      </div>
      <div style={{ fontSize: 10, color: C.fog, marginBottom: 20 }}>
        MySQL · IBM AML transactions · 487,312 records · SQLAlchemy async pool
      </div>

      {/* ── Connection card ── */}
      <div className="card-hover" style={{ background: C.card, border: `1px solid ${C.rim}`, borderRadius: 12, padding: "22px 26px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: scanPhase > 0 ? 18 : 0 }}>
          <div>
            <div style={{ fontSize: 13, color: C.white, fontWeight: 700 }}>aml_db · localhost:3306</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "throb 2s ease-in-out infinite" }} />
              <span style={{ fontSize: 10, color: "#22c55e" }}>Connected</span>
              <span style={{ fontSize: 10, color: C.fog }}>· IBM AML · 487,312 rows · 25 rules</span>
            </div>
          </div>
          <button
            onClick={runScan}
            disabled={scanPhase === 1}
            style={{
              background:     scanPhase === 1 ? C.rim : `linear-gradient(135deg,${C.teal},#00a090)`,
              color:          scanPhase === 1 ? C.fog : "#000",
              border:         "none",
              padding:        "11px 28px",
              borderRadius:   8,
              fontWeight:     900,
              fontSize:       12,
              letterSpacing:  "0.07em",
              fontFamily:     "'JetBrains Mono',monospace",
              cursor:         scanPhase === 1 ? "not-allowed" : "pointer",
              opacity:        scanPhase === 1 ? 0.7 : 1,
              boxShadow:      scanPhase !== 1 ? C.glow(C.teal, 12) : "none",
            }}
          >
            {scanPhase === 1 ? "⟳  SCANNING..." : "⚡  RUN AML SCAN"}
          </button>
        </div>

        {/* Progress + log */}
        {scanPhase > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: C.fog }}>Scan progress</span>
              <span style={{ fontSize: 10, color: C.teal }}>{scanPct}%</span>
            </div>
            <div style={{ position: "relative", height: 5, background: C.ghost, borderRadius: 5, overflow: "hidden", marginBottom: 14 }}>
              <div style={{
                height: "100%", width: `${scanPct}%`,
                background: `linear-gradient(90deg,${C.teal},#7c3aed)`,
                borderRadius: 5, transition: "width .3s", backgroundSize: "200%",
                animation: scanPhase === 1 ? "shimmer 1.2s linear infinite" : "none",
              }} />
            </div>
            <div style={{ background: C.void, borderRadius: 9, padding: "14px 16px", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, lineHeight: 2.1, maxHeight: 250, overflowY: "auto" }}>
              {scanLog.map((l, i) => (
                <div key={i} style={{ display: "flex", gap: 10, animation: "fadeUp .2s ease" }}>
                  <span style={{ color: C.fog, minWidth: 52 }}>[{l.t}]</span>
                  <span style={{ color: l.col }}>{l.msg}</span>
                </div>
              ))}
              {scanPhase === 1 && <span style={{ color: C.teal, animation: "blink 1s step-end infinite" }}>█</span>}
            </div>
          </div>
        )}
      </div>

      {/* ── Table cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {DB_TABLES.map(t => (
          <div key={t.nm} className="card-hover" style={{ background: C.card, border: `1px solid ${SEVER[t.risk]?.col}22`, borderRadius: 10, padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: C.teal, fontWeight: 700, fontSize: 13 }}>{t.nm}</span>
              <Badge lbl={t.risk} col={SEVER[t.risk]?.col} sm />
            </div>
            <div style={{ fontSize: 10, color: C.fog, marginBottom: 3 }}>Rows: <span style={{ color: C.mist }}>{t.rows}</span></div>
            <div style={{ fontSize: 10, color: C.fog, marginBottom: 8 }}>Violations: <span style={{ color: SEVER[t.risk]?.col, fontWeight: 700 }}>{t.v}</span></div>
            <div style={{ fontSize: 8.5, color: C.fog, lineHeight: 1.6, borderTop: `1px solid ${C.rim}`, paddingTop: 8 }}>{t.fields}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
