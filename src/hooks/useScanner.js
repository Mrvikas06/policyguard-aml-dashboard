import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// useScanner — Simulates IBM AML MySQL scan via PolicyGuard.AI
// ─────────────────────────────────────────────────────────────────────────────

const SCAN_LOG_STEPS = [
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

// phase: "idle" | "running" | "done"
export function useScanner() {
  const [phase, setPhase]       = useState("idle");
  const [progress, setProgress] = useState(0);
  const [log, setLog]           = useState([]);

  const run = (onDone) => {
    setPhase("running");
    setProgress(0);
    setLog([]);

    let i = 0;
    const iv = setInterval(() => {
      setProgress(Math.min(100, Math.round(((i + 1) / SCAN_LOG_STEPS.length) * 100)));
      setLog((prev) => [...prev, SCAN_LOG_STEPS[i]]);
      i++;
      if (i >= SCAN_LOG_STEPS.length) {
        clearInterval(iv);
        setTimeout(() => {
          setPhase("done");
          onDone?.();
        }, 400);
      }
    }, 300);
  };

  return { phase, progress, log, run };
}
