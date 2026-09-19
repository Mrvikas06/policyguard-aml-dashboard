// ─────────────────────────────────────────────────────────────────────────────
// Progress — Animated progress bar with semantic colors
// ─────────────────────────────────────────────────────────────────────────────

import { cn, riskColor } from "../../theme/colors";

export function Progress({
  value = 0,
  color,
  riskScore,
  severity,
  height = 8,
  showLabel = false,
  label,
  style,
  className = "",
  ...props
}) {
  const pct = Math.max(0, Math.min(100, value));
  
  let progressColor = color;
  if (riskScore !== undefined) progressColor = riskColor(riskScore);
  else if (severity) progressColor = `var(--color-${severity})`;
  else if (!progressColor) progressColor = "var(--color-brand)";

  return (
    <div
      {...props}
      className={cn(className)}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || `Progress: ${pct}%`}
    >
      <div style={{
        width: "100%", 
        height, 
        background: "var(--color-surface-alt)", 
        borderRadius: "var(--radius-full)", 
        overflow: "hidden", 
        border: "1px solid var(--color-border)"
      }}>
        <div
          style={{
            height: "100%",
            background: progressColor.includes('var') ? progressColor : `linear-gradient(90deg, ${progressColor} ${progressColor})`,
            borderRadius: "var(--radius-full)",
            transition: "width 0.3s ease-out",
            width: `${pct}%`,
            boxShadow: `0 0 10px ${progressColor}`
          }}
        />
      </div>
      {showLabel && (
        <div style={{ marginTop: 6, fontSize: 11.5, color: "var(--color-text-dim)", textAlign: "right" }}>
          {label || `${Math.round(pct)}%`}
        </div>
      )}
    </div>
  );
}