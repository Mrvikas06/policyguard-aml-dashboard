import { useState, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CountUp — Animates a number from 0 to `to` over `dur` milliseconds
// ─────────────────────────────────────────────────────────────────────────────

export function CountUp({ to, pfx = "", sfx = "", dur = 1400 }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let current = 0;
    const steps = 60;
    const inc   = to / steps;
    let   i     = 0;

    const iv = setInterval(() => {
      i++;
      current = Math.min(to, current + inc);
      setVal(Math.round(current));
      if (i >= steps) clearInterval(iv);
    }, dur / steps);

    return () => clearInterval(iv);
  }, [to, dur]);

  return (
    <>
      {pfx}
      {val.toLocaleString()}
      {sfx}
    </>
  );
}
