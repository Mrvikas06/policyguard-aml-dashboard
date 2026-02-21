import { useState } from "react";
import { C } from "../theme/colors";
import { Badge } from "../components/ui/Badge";

const RULE_GROUPS = [
  {
    cat: "CTR THRESHOLD RULES", col: "#ff3333", basis: "BSA §5313",
    rules: [
      { id: "R-001", desc: "Single transaction > $10,000 — mandatory CTR filing" },
      { id: "R-002", desc: "Multiple transactions totalling >$10,000/24h (structuring)" },
      { id: "R-003", desc: "Amount exactly $9,999 or $9,900 — just-below structuring" },
    ],
  },
  {
    cat: "VELOCITY & FREQUENCY", col: "#ff6b00", basis: "FATF R.20",
    rules: [
      { id: "R-008", desc: ">5 transfers to same beneficiary within 24 hours" },
      { id: "R-009", desc: ">10 distinct recipients from one account within 1 hour" },
      { id: "R-010", desc: ">20 transactions from single account within 24 hours" },
    ],
  },
  {
    cat: "NETWORK & LAYERING", col: "#f59e0b", basis: "FATF R.16",
    rules: [
      { id: "R-013", desc: "Funds routed through 3+ intermediate accounts (layering)" },
      { id: "R-014", desc: "Circular transfer: funds return to origin within 48 hours" },
      { id: "R-015", desc: "Account receiving >80% of funds from single source" },
    ],
  },
  {
    cat: "PAYMENT-TYPE RULES", col: "#00d4c8", basis: "FinCEN SAR",
    rules: [
      { id: "R-016", desc: "New account (<7 days) transacting >$5,000" },
      { id: "R-018", desc: "Cash withdrawal exceeding $5,000 per business day" },
      { id: "R-019", desc: "TRANSFER where origin account balance drops to $0" },
    ],
  },
];

// ── PDF Upload Widget ──────────────────────────────────────────────
function PdfUpload({ notify }) {
  const [phase, setPhase] = useState(0); // 0=idle 1=uploading 2=extracting 3=done
  const [pct,   setPct  ] = useState(0);

  const start = () => {
    setPhase(1); setPct(0);
    let p = 0;
    const iv1 = setInterval(() => {
      p += Math.random() * 14 + 2;
      if (p >= 100) {
        p = 100; clearInterval(iv1); setPhase(2);
        let p2 = 0;
        const iv2 = setInterval(() => {
          p2 += Math.random() * 11 + 3;
          if (p2 >= 100) {
            p2 = 100; clearInterval(iv2);
            setTimeout(() => { setPhase(3); notify("25 AML rules extracted from PDF ✓"); }, 300);
          }
          setPct(Math.min(p2, 100));
        }, 120);
      }
      setPct(Math.min(p, 100));
    }, 90);
  };

  return (
    <div className="card-hover" style={{ background: C.card, border: `1px solid ${C.rim}`, borderRadius: 12, padding: "22px 24px", marginBottom: 18 }}>
      <div style={{ fontSize: 9, color: C.fog, letterSpacing: "0.12em", marginBottom: 14 }}>◈ PDF INGESTION PIPELINE</div>

      {phase === 0 && (
        <div onClick={start}
          style={{ border: `2px dashed ${C.teal}30`, borderRadius: 10, padding: "28px 20px", textAlign: "center", cursor: "pointer", transition: "all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal + "70"; e.currentTarget.style.background = C.tealDim; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.teal + "30"; e.currentTarget.style.background = "transparent"; }}>
          <div style={{ fontSize: 26, marginBottom: 8 }}>◈</div>
          <div style={{ color: C.teal, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Intellium_AML_Policy_Document.pdf</div>
          <div style={{ color: C.fog, fontSize: 10, marginBottom: 14 }}>8 pages · BSA § 5313 · FinCEN · FATF R.16 R.20</div>
          <div style={{ display: "inline-block", background: `linear-gradient(135deg,${C.teal},#00a090)`, color: "#000", padding: "8px 28px", borderRadius: 7, fontWeight: 900, fontSize: 11, letterSpacing: "0.07em" }}>UPLOAD + EXTRACT</div>
        </div>
      )}

      {(phase === 1 || phase === 2) && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: C.mist }}>{phase === 1 ? "Uploading PDF..." : "Claude Sonnet extracting rules..."}</span>
            <span style={{ fontSize: 11, color: C.teal }}>{Math.round(pct)}%</span>
          </div>
          <div style={{ height: 5, background: C.ghost, borderRadius: 5, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${C.teal},#7c3aed)`, borderRadius: 5, backgroundSize: "200%", animation: "shimmer 1.4s linear infinite", transition: "width .1s" }} />
          </div>
          <div style={{ fontSize: 9, color: C.fog }}>
            {phase === 1
              ? "→ Parsing structure with PyMuPDF · LangChain chunking (512-token, 64 overlap)..."
              : "→ Sending to Claude Sonnet · Synthesizing {rule, severity, sql_pattern, explanation}..."}
          </div>
        </div>
      )}

      {phase === 3 && (
        <div style={{ background: "#22c55e0a", border: "1px solid #22c55e30", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22, color: "#22c55e" }}>✓</span>
          <div>
            <div style={{ color: "#22c55e", fontWeight: 700, fontSize: 13 }}>25 AML compliance rules extracted successfully</div>
            <div style={{ fontSize: 9, color: C.fog, marginTop: 3 }}>CTR ×3 · Structuring ×3 · Velocity ×3 · Layering ×2 · Cash ×2 · Account ×2 · Payment ×4 · Drain ×1 · Circular ×1 · Misc ×4</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main View ──────────────────────────────────────────────────────
export function PoliciesView({ notify }) {
  return (
    <div style={{ padding: "24px 28px", animation: "fadeUp .4s ease" }}>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: "0.1em", marginBottom: 4 }}>
        POLICY <span style={{ color: C.teal }}>RULES</span>
      </div>
      <div style={{ fontSize: 10, color: C.fog, marginBottom: 20 }}>
        LLM-extracted from Intellium_AML_Policy_Document.pdf · 25 rules · BSA · FinCEN · FATF
      </div>

      <PdfUpload notify={notify} />

      {RULE_GROUPS.map(g => (
        <div key={g.cat} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: g.col, boxShadow: `0 0 8px ${g.col}` }} />
            <span style={{ fontSize: 9, color: g.col, fontWeight: 800, letterSpacing: "0.14em" }}>{g.cat}</span>
            <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg,${g.col}30,transparent)` }} />
            <Badge lbl={g.basis} col={g.col} sm />
          </div>
          {g.rules.map(r => (
            <div key={r.id} className="row-hover"
              style={{ background: C.card, border: `1px solid ${C.rim}`, borderLeft: `2px solid ${g.col}`, borderRadius: 8, padding: "10px 16px", marginBottom: 5, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: C.teal, fontWeight: 800, fontSize: 11, minWidth: 44 }}>{r.id}</span>
              <span style={{ flex: 1, color: C.mist, fontSize: 11 }}>{r.desc}</span>
              <Badge lbl={g.col === "#ff3333" || g.col === "#ff6b00" ? "CRITICAL" : "HIGH"} col={g.col === C.teal ? C.orange : g.col} sm />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
