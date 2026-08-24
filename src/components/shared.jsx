// ─────────────────────────────────────────────────────────────────────────────
// Shared UI Components — Reusable across views
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from "react";
import { C, GLOBAL_CSS, riskColor, riskLabel, cn, formatNumber, formatCurrency, formatRelative, formatTime, formatDate } from "../theme/colors";
import { Button } from "./ui/Button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "./ui/Card";
import { Progress } from "./ui/Progress";
import { Tabs } from "./ui/Tabs";
import { Badge } from "./ui/Badge";
import { Separator } from "./ui/Separator";
import { BrandMark } from "./ui/BrandMark";

const QUICK_FILTERS = ["Today", "24 hours", "7 days", "30 days", "Custom"];

export { BrandMark, QUICK_FILTERS, cn, formatNumber, formatCurrency, formatRelative, formatTime, formatDate };

// ─────────────────────────────────────────────────────────────────────────────
// SectionHeading — Consistent section header with actions
// ─────────────────────────────────────────────────────────────────────────────
export function SectionHeading({ eyebrow, title, description, actions, children }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
      <div>
        {eyebrow && <div style={{ color: C.brand, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{eyebrow}</div>}
        <h2 style={{ margin: 0, fontSize: 24, lineHeight: 1.15, letterSpacing: "-0.03em", color: C.text }}>{title}</h2>
        {description && <p style={{ margin: "8px 0 0", color: C.textDim, fontSize: 13.5, lineHeight: 1.5, maxWidth: 760 }}>{description}</p>}
      </div>
      {(actions || children) && <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{actions}{children}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StatCard — KPI metric card with sparkline
// ─────────────────────────────────────────────────────────────────────────────
export function StatCard({ label, value, trend, period, spark, tone = C.brand, trendColor }) {
  const deltaColor = trendColor || (trend?.startsWith("-") ? C.resolved : trend?.startsWith("+") ? C.critical : C.textDim);
  const trendIcon = trend?.startsWith("-") ? "↓" : trend?.startsWith("+") ? "↑" : "→";

  return (
    <div className="card metric-card" style={{ padding: 0, overflow: "hidden", minHeight: 156 }}>
      <div style={{ height: 4, background: tone }} />
      <div style={{ padding: 20, display: "grid", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: C.textDim, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
              <div style={{ color: C.text, fontSize: 32, fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1 }}>{value}</div>
              {trend && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: C.radiusFull, background: `${deltaColor}1A`, color: deltaColor, border: `1px solid ${deltaColor}33`, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                  {trendIcon}{trend}
                </span>
              )}
            </div>
            <div style={{ color: C.textDim, fontSize: 12, marginTop: 6 }}>{period}</div>
          </div>
          <div style={{ width: 100, alignSelf: "flex-start" }}>
            <svg viewBox="0 0 100 32" style={{ width: "100%", height: "auto" }}>
              {spark && spark.length > 1 && (
                <>
                  <polyline fill="none" stroke={tone} strokeWidth="2" points={spark.map((v, i) => `${(i / (spark.length - 1)) * 100},${32 - (v / Math.max(...spark)) * 28}`).join(" ")} strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatGrid({ stats }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
      {stats.map((s) => <StatCard key={s.label} {...s} />)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DonutScore — Circular risk score indicator
// ─────────────────────────────────────────────────────────────────────────────
export function DonutScore({ score, label, detail }) {
  const radius = 42;
  const stroke = 10;
  const normalized = Math.min(100, Math.max(0, score));
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalized / 100) * circumference;
  const ringColor = riskColor(score);

  return (
    <Card style={{ padding: 20, height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>AML Risk Score</div>
          <div style={{ color: C.textDim, fontSize: 13, marginTop: 3 }}>{detail}</div>
        </div>
        <Badge variant="soft" color={ringColor} size="sm">{riskLabel(score)}</Badge>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 20, alignItems: "center" }}>
        <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto" }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke={C.surfaceAlt} strokeWidth={stroke} />
            <circle cx="60" cy="60" r={radius} fill="none" stroke={ringColor} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 60 60)" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", color: C.text }}>{normalized}%</div>
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>{label}</div>
          </div>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {[
            { label: "Critical", value: 4, color: C.critical },
            { label: "High", value: 3, color: C.high },
            { label: "Resolved", value: 2, color: C.resolved },
            { label: "AML Confirmed", value: 7, color: C.brand },
          ].map((item) => (
            <div key={item.label} style={{ display: "grid", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: C.textDim }}>{item.label}</span>
                <span style={{ color: item.color, fontWeight: 700 }}>{item.value}</span>
              </div>
              <Progress value={item.label === "Critical" ? 82 : item.label === "High" ? 68 : item.label === "Resolved" ? 54 : 78} color={item.color} height={7} />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AnalyticsChart — Trend chart with tabs and stats
// ─────────────────────────────────────────────────────────────────────────────
export function AnalyticsChart({ title, values, tabValue, setTabValue, rangeValue, setRangeValue, color = C.brand, subtitle }) {
  const w = 840;
  const h = 280;
  const padX = 30;
  const padY = 26;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const latest = values.at(-1) ?? 0;
  const previous = values.at(-2) ?? latest;
  const average = values.reduce((sum, v) => sum + v, 0) / Math.max(values.length, 1);
  const delta = latest - previous;
  const deltaPct = previous === 0 ? 0 : (delta / previous) * 100;
  const coordinates = values.map((v, i) => {
    const x = padX + (i / Math.max(values.length - 1, 1)) * (w - padX * 2);
    const y = padY + (1 - (v - min) / range) * (h - padY * 2);
    return { x, y, v };
  });
  const points = coordinates.map(p => `${p.x},${p.y}`).join(" ");
  const fillPoints = `${points} ${w - padX},${h - padY} ${padX},${h - padY}`;

  return (
    <Card className="analytics-shell" style={{ padding: 20, height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <div style={{ color: C.text, fontSize: 16, fontWeight: 700 }}>{title}</div>
          <div style={{ color: C.textDim, fontSize: 13, marginTop: 3 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <Tabs items={["Transaction Volume", "Risk Score", "Violations", "Confirmed Threats", "SAR Cases"]} value={tabValue} onChange={setTabValue} />
          <Tabs items={["Today", "7D", "30D", "90D"]} value={rangeValue} onChange={setRangeValue} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        {[
          { label: "Current", value: formatNumber(latest), tone: color },
          { label: "Average", value: formatNumber(Math.round(average)), tone: C.textDim },
          { label: "Peak", value: formatNumber(max), tone: C.high },
        ].map((item) => (
          <div key={item.label} className="card" style={{ padding: 12, display: "grid", gap: 6 }}>
            <div style={{ color: C.textDim, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{item.label}</div>
            <div style={{ color: item.tone, fontSize: 24, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>{item.value}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ border: `1px solid ${C.border}`, borderRadius: C.radiusLg, background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)", padding: 16 }}>
        <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <linearGradient id="analytics-fill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4].map((i) => {
            const y = padY + i * ((h - padY * 2) / 4);
            const valueAtLine = max - (i / 4) * range;
            return (
              <g key={i}>
                <line x1={padX} y1={y} x2={w - padX} y2={y} stroke={C.border} strokeWidth="1" strokeDasharray={i === 2 ? "4 4" : "0"} />
                <text x={10} y={y} fill={C.textDim} fontSize="10" dominantBaseline="middle" textAnchor="start">
                  {formatNumber(Math.round(valueAtLine))}
                </text>
              </g>
            );
          })}
          <line x1={coordinates.at(-1)?.x ?? w - padX} y1={padY} x2={coordinates.at(-1)?.x ?? w - padX} y2={h - padY} stroke={color} strokeDasharray="4 4" opacity="0.18" />
          <polygon points={fillPoints} fill="url(#analytics-fill)" />
          <polyline fill="none" stroke={color} strokeWidth="3.25" points={points} strokeLinecap="round" strokeLinejoin="round" />
          {coordinates.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={index === coordinates.length - 1 ? 4.3 : 3.2}
              fill={index === coordinates.length - 1 ? color : "#fff"}
              stroke={color}
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, color: C.textDim, fontSize: 12, gap: 12, flexWrap: "wrap" }}>
        <span>Enterprise trend line with the current window emphasized.</span>
        <span>{rangeValue} · avg {formatNumber(Math.round(average))} · Δ {delta >= 0 ? "+" : ""}{deltaPct.toFixed(1)}%</span>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DistributionCard — Risk distribution bars
// ─────────────────────────────────────────────────────────────────────────────
export function DistributionCard({ values }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Distribution</CardTitle>
        <CardDescription>Semantic risk split across critical, high, medium, low and resolved cases.</CardDescription>
      </CardHeader>
      <CardContent style={{ display: "grid", gap: 12 }}>
        {values.map((item) => (
          <div key={item.label} style={{ display: "grid", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: C.text }}>{item.label}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.textDim }}>{item.value}%</span>
            </div>
            <Progress value={item.value} color={item.color} height={10} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}