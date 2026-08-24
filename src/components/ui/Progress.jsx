// ─────────────────────────────────────────────────────────────────────────────
// Progress — Animated progress bar with semantic colors
// ─────────────────────────────────────────────────────────────────────────────

import { C, styleUtils, cn, riskColor } from "../../theme/colors";

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
  else if (severity) progressColor = C[severity] || C.brand;
  else if (!progressColor) progressColor = C.brand;

  return (
    <div
      {...props}
      className={cn("progress", className)}
      style={{
        ...styleUtils.progress(progressColor, height),
        ...style,
      }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || `Progress: ${pct}%`}
    >
      <div
        className="progress-fill"
        style={{
          ...styleUtils.progressFill(progressColor),
          width: `${pct}%`,
        }}
      />
      {showLabel && (
        <div style={{ marginTop: 6, fontSize: 11.5, color: C.textDim, textAlign: "right" }}>
          {label || `${Math.round(pct)}%`}
        </div>
      )}
    </div>
  );
}