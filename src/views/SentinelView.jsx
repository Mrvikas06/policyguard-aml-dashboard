import { C, styleUtils } from "../theme/colors";
import { ParticleNet } from "../components/canvas/ParticleNet";

const { inp } = styleUtils;

export function SentinelView({ liveOn, toggleLive, liveFeed }) {
  return (
    <div style={{ padding: "24px 28px", animation: "fadeUp .4s ease" }}>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: "0.1em", marginBottom: 4 }}>
        SENTINEL <span style={{ color: "#22c55e" }}>MONITOR</span>
      </div>
      <div style={{ fontSize: 10, color: C.fog, marginBottom: 20 }}>
        Debezium CDC · MySQL binlog · Apache Kafka 3.7 · Real-time AML detection
      </div>

      {/* ── Controls ── */}
      <div className="card-hover" style={{ background: C.card, border: `1px solid ${C.rim}`, borderRadius: 12, padding: "22px 26px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <select style={{ ...inp, minWidth: 220 }}>
            <option>Real-time CDC — Debezium + Kafka</option>
            <option>Every 1 minute (APScheduler)</option>
            <option>Every 5 minutes</option>
            <option>Hourly batch scan</option>
          </select>

          <button
            onClick={toggleLive}
            style={{
              background:    liveOn ? `linear-gradient(135deg,${C.red},#cc0000)` : `linear-gradient(135deg,#22c55e,#15803d)`,
              color:         "#000",
              border:        "none",
              padding:       "10px 26px",
              borderRadius:  8,
              fontWeight:    900,
              fontSize:      12,
              letterSpacing: "0.07em",
              fontFamily:    "'JetBrains Mono',monospace",
              cursor:        "pointer",
              boxShadow:     C.glow(liveOn ? C.red : "#22c55e", 12),
            }}
          >
            {liveOn ? "⏹  STOP SENTINEL" : "▶  START SENTINEL"}
          </button>

          {liveOn && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#22c55e10", border: "1px solid #22c55e30", padding: "8px 16px", borderRadius: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "throb 1.5s ease-in-out infinite" }} />
              <span style={{ color: "#22c55e", fontSize: 11, fontWeight: 700 }}>SENTINEL LIVE — Debezium CDC active</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Particle network + feed ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 14 }}>

        <div className="card-hover" style={{ background: C.card, border: `1px solid ${C.rim}`, borderRadius: 12, padding: "20px 24px", height: 260, overflow: "hidden" }}>
          <div style={{ fontSize: 9, color: C.fog, letterSpacing: "0.12em", marginBottom: 12 }}>◈ LIVE TRANSACTION NETWORK</div>
          <ParticleNet w={320} h={190} />
        </div>

        <div className="card-hover" style={{ background: C.card, border: `1px solid ${C.rim}`, borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ fontSize: 9, color: C.fog, letterSpacing: "0.12em", marginBottom: 12 }}>◈ KAFKA CDC STREAM</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 190, overflowY: "auto" }}>
            {liveFeed.map((l, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, padding: "7px 10px",
                background: C.surface, borderRadius: 6,
                borderLeft: `2px solid ${l.lvl === "ok" ? "#22c55e" : l.lvl === "crit" ? C.red : C.teal}`,
                animation: i === 0 ? "fadeUp .3s ease" : "none",
              }}>
                <span style={{ color: C.fog, fontSize: 9, minWidth: 58 }}>{l.ts}</span>
                <span style={{ color: l.lvl === "ok" ? "#22c55e" : l.lvl === "crit" ? C.red : C.teal, fontSize: 10, fontWeight: 600 }}>
                  {l.lvl === "ok" ? "✓" : l.lvl === "crit" ? "◈" : "·"} {l.msg}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
