import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// useLiveMonitor — Simulates Debezium CDC Kafka stream
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_FEED = [
  { ts: "09:41:18", msg: "Debezium synced 48 new transactions — 0 flagged", lvl: "ok" },
  { ts: "09:38:05", msg: "V-009 resolved — CTR Form 104 filed by officer",  lvl: "info" },
  { ts: "09:31:22", msg: "CRITICAL: 3 new AML violations detected",          lvl: "crit" },
  { ts: "09:28:11", msg: "Debezium synced 103 new transactions — 0 flagged", lvl: "ok" },
];

export function useLiveMonitor() {
  const [active, setActive]   = useState(false);
  const [feed, setFeed]       = useState(INITIAL_FEED);
  const intervalRef           = useRef(null);

  useEffect(() => {
    if (active) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const ts  = [
          String(now.getHours()).padStart(2, "0"),
          String(now.getMinutes()).padStart(2, "0"),
          String(now.getSeconds()).padStart(2, "0"),
        ].join(":");

        const r = Math.random();
        const entries = [
          { ts, msg: `Debezium synced ${Math.floor(Math.random() * 180 + 20)} transactions — 0 flagged`, lvl: "ok" },
          { ts, msg: `ALERT: New transaction matches R-00${Math.floor(Math.random() * 9 + 1)} — queued for review`, lvl: "crit" },
          { ts, msg: `Kafka consumer lag: ${Math.floor(Math.random() * 20)}ms — nominal`, lvl: "info" },
        ];

        const entry = r < 0.5 ? entries[0] : r < 0.8 ? entries[2] : entries[1];
        setFeed((prev) => [entry, ...prev].slice(0, 20));
      }, 2600);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [active]);

  const toggle = () => setActive((a) => !a);

  return { active, feed, toggle };
}
