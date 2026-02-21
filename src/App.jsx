import { useState, useEffect, useRef } from "react";

// ── Theme ────────────────────────────────────────────────────────────
import { C, GLOBAL_CSS } from "./theme/colors";

// ── Data ─────────────────────────────────────────────────────────────
import { VIOLATIONS, LIVE_TXNS } from "./data/violations";

// ── Canvas components ─────────────────────────────────────────────────
import { HexGrid }     from "./components/canvas/HexGrid";
import { ParticleNet } from "./components/canvas/ParticleNet";
import { LayerGraph }  from "./components/canvas/LayerGraph";

// ── UI components ─────────────────────────────────────────────────────
import { Badge }    from "./components/ui/Badge";
import { CountUp }  from "./components/ui/CountUp";
import { SparkBar } from "./components/ui/SparkBar";
import { Donut }    from "./components/ui/Donut";
import { Toast }    from "./components/ui/Toast";

// ── Layout ────────────────────────────────────────────────────────────
import { Topbar } from "./components/layout/Topbar";

// ── Views ─────────────────────────────────────────────────────────────
import { OverviewView  } from "./views/OverviewView";
import { ThreatsView   } from "./views/ThreatsView";
import { PoliciesView  } from "./views/PoliciesView";
import { ScannerView   } from "./views/ScannerView";
import { NetworkView   } from "./views/NetworkView";
import { SentinelView  } from "./views/SentinelView";
import { ReportsView   } from "./views/ReportsView";

// ─────────────────────────────────────────────────────────────────────
// Scanner log steps
// ─────────────────────────────────────────────────────────────────────
const SCAN_STEPS = [
  { t: "CONN",  col: "#00d4c8", msg: "Connecting MySQL  aml_db@localhost:3306..." },
  { t: "AUTH",  col: "#22c55e", msg: "Connection established — IBM AML dataset ready" },
  { t: "RULES", col: "#00d4c8", msg: "Loading 25 AML policy rules from policy PDF..." },
  { t: "INIT",  col: "#00d4c8", msg: "Scanning transactions — 487,312 rows in queue" },
  { t: "R-001", col: "#f59e0b", msg: "CTR threshold check → 1 violation (TXN-88821 $12,500)" },
  { t: "R-002", col: "#f59e0b", msg: "Structuring check → 1 violation (ACC-1190 pattern)" },
  { t: "R-008", col: "#f59e0b", msg: "Velocity check → 1 violation (ACC-7712 × 8 transfers)" },
  { t: "R-013", col: "#ff3333", msg: "Layering analysis → 1 violation (4-hop TXN-34421)" },
  { t: "LLM",   col: "#00d4c8", msg: "LLM semantic validation on 7 flagged records..." },
  { t: "TRUTH", col: "#00d4c8", msg: "Cross-referencing is_laundering ground truth..." },
  { t: "DONE",  col: "#ff3333", msg: "⚡ SCAN COMPLETE — 10 violations · Recall 80% · Precision 80%" },
];

// ─────────────────────────────────────────────────────────────────────
// Root App
// ─────────────────────────────────────────────────────────────────────
export default function App() {
  // ── Navigation ──
  const [view, setView] = useState("overview");

  // ── Violations state ──
  const [viols, setViols] = useState(VIOLATIONS);
  const [expanded, setExpanded] = useState(null);
  const [sevF, setSevF] = useState("all");
  const [stF,  setStF ] = useState("all");

  // ── Scanner ──
  const [scanPhase,    setScanPhase   ] = useState(0); // 0=idle 1=running 2=done
  const [scanPct,      setScanPct     ] = useState(0);
  const [scanLog,      setScanLog     ] = useState([]);

  // ── Sentinel (Live CDC monitor) ──
  const [liveOn, setLiveOn] = useState(false);
  const [liveFeed, setLiveFeed] = useState([
    { ts: "09:41:18", msg: "Debezium synced 48 new transactions — 0 flagged", lvl: "ok" },
    { ts: "09:38:05", msg: "V-009 resolved — CTR Form 104 filed by officer",  lvl: "info" },
    { ts: "09:31:22", msg: "CRITICAL: 3 new AML violations detected",          lvl: "crit" },
    { ts: "09:28:11", msg: "Debezium synced 103 new transactions — 0 flagged", lvl: "ok" },
  ]);
  const liveRef = useRef(null);

  // ── Toast notifications ──
  const [toast, setToast] = useState(null);

  // ─── Derived stats ───────────────────────────────────────────────
  const open     = viols.filter(v => v.status === "open").length;
  const crit     = viols.filter(v => v.severity === "critical").length;
  const resol    = viols.filter(v => v.status === "resolved").length;
  const conf     = viols.filter(v => v.confirmed).length;
  const score    = Math.max(38, 100 - open * 7 - crit * 4);
  const scoreCol = score >= 70 ? C.teal : score >= 50 ? C.amber : C.red;

  // ─── Notification helper ─────────────────────────────────────────
  const notify = (msg, col = C.teal) => {
    setToast({ msg, col });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Scanner ────────────────────────────────────────────────────
  const runScan = () => {
    setScanPhase(1); setScanPct(0); setScanLog([]);
    let i = 0;
    const iv = setInterval(() => {
      setScanPct(Math.min(100, Math.round(((i + 1) / SCAN_STEPS.length) * 100)));
      setScanLog(prev => [...prev, SCAN_STEPS[i]]);
      i++;
      if (i >= SCAN_STEPS.length) {
        clearInterval(iv);
        setTimeout(() => {
          setScanPhase(2);
          notify("Scan complete — 10 AML violations detected", C.amber);
        }, 400);
      }
    }, 300);
  };

  // ─── Sentinel CDC simulation ─────────────────────────────────────
  const toggleLive = () => setLiveOn(on => !on);

  useEffect(() => {
    if (liveOn) {
      liveRef.current = setInterval(() => {
        const now = new Date();
        const ts  = [
          String(now.getHours()).padStart(2, "0"),
          String(now.getMinutes()).padStart(2, "0"),
          String(now.getSeconds()).padStart(2, "0"),
        ].join(":");
        const r = Math.random();
        const entry = r < 0.5
          ? { ts, msg: `Debezium synced ${Math.floor(Math.random() * 180 + 20)} transactions — 0 flagged`, lvl: "ok" }
          : r < 0.8
          ? { ts, msg: `Kafka consumer lag: ${Math.floor(Math.random() * 20)}ms — nominal`, lvl: "info" }
          : { ts, msg: `ALERT: New transaction matches R-00${Math.floor(Math.random() * 9 + 1)} — queued for review`, lvl: "crit" };
        setLiveFeed(prev => [entry, ...prev].slice(0, 20));
      }, 2600);
    } else {
      clearInterval(liveRef.current);
    }
    return () => clearInterval(liveRef.current);
  }, [liveOn]);

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'JetBrains Mono',monospace", background: C.void, minHeight: "100vh", display: "flex", flexDirection: "column", color: C.white, overflow: "hidden" }}>

      {/* ── Global CSS (keyframes, scrollbar, hover classes) ── */}
      <style>{GLOBAL_CSS}</style>

      {/* ── Toast ── */}
      <Toast toast={toast} />

      {/* ── Top navigation bar + live ticker ── */}
      <Topbar
        view={view}
        setView={setView}
        openCount={open}
        liveOn={liveOn}
      />

      {/* ── Page body ── */}
      <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>

        {view === "overview" && (
          <OverviewView
            viols={viols}
            score={score}
            scoreCol={scoreCol}
            open={open}
            crit={crit}
            resol={resol}
            conf={conf}
            setView={setView}
            setExpanded={setExpanded}
          />
        )}

        {view === "threats" && (
          <ThreatsView
            viols={viols}
            setViols={setViols}
            expanded={expanded}
            setExpanded={setExpanded}
            sevF={sevF} setSevF={setSevF}
            stF={stF}   setStF={setStF}
            open={open}
            resol={resol}
            conf={conf}
            notify={notify}
          />
        )}

        {view === "policies" && (
          <PoliciesView notify={notify} />
        )}

        {view === "scanner" && (
          <ScannerView
            scanPhase={scanPhase}
            scanPct={scanPct}
            scanLog={scanLog}
            runScan={runScan}
          />
        )}

        {view === "network" && (
          <NetworkView />
        )}

        {view === "sentinel" && (
          <SentinelView
            liveOn={liveOn}
            toggleLive={toggleLive}
            liveFeed={liveFeed}
          />
        )}

        {view === "reports" && (
          <ReportsView
            viols={viols}
            score={score}
            scoreCol={scoreCol}
            crit={crit}
            conf={conf}
            resol={resol}
            notify={notify}
          />
        )}

      </div>
    </div>
  );
}
