import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// usePdfUpload — Simulates PDF upload → LLM rule extraction pipeline
// phase: 0=idle | 1=uploading | 2=extracting | 3=done
// ─────────────────────────────────────────────────────────────────────────────

export function usePdfUpload() {
  const [phase, setPhase]       = useState(0);
  const [progress, setProgress] = useState(0);

  const start = (onDone) => {
    setPhase(1);
    setProgress(0);

    // Phase 1 — uploading
    let p = 0;
    const iv1 = setInterval(() => {
      p += Math.random() * 14 + 2;
      if (p >= 100) {
        p = 100;
        clearInterval(iv1);
        setProgress(100);
        setPhase(2);

        // Phase 2 — LLM extraction
        let p2 = 0;
        const iv2 = setInterval(() => {
          p2 += Math.random() * 11 + 3;
          if (p2 >= 100) {
            p2 = 100;
            clearInterval(iv2);
            setProgress(100);
            setTimeout(() => {
              setPhase(3);
              onDone?.();
            }, 300);
          }
          setProgress(Math.min(p2, 100));
        }, 120);
      }
      setProgress(Math.min(p, 100));
    }, 90);
  };

  const reset = () => { setPhase(0); setProgress(0); };

  return { phase, progress, start, reset };
}
