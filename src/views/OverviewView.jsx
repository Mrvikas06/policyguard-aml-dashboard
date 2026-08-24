// ─────────────────────────────────────────────────────────────────────────────
// Overview View — Executive AML Dashboard
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { C, GLOBAL_CSS, riskColor, riskLabel, formatNumber, formatCurrency, formatRelative } from "../theme/colors";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../components/ui/Card";
import { Progress } from "../components/ui/Progress";
import { Tabs } from "../components/ui/Tabs";
import { Badge } from "../components/ui/Badge";

const QUICK_FILTERS = ["Today", "24 hours", "7 days", "30 days", "Custom"];

export function OverviewView({ openThreat, selectedPeriod, setSelectedPeriod, selectedRiskMetric, setSelectedRiskMetric, setPage }) {
  const [kpis, setKpis] = useState([]);
  const [riskDistribution, setRiskDistribution] = useState([]);
  const [overviewSeries, setOverviewSeries] = useState([]);
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [statsRes, threatsRes] = await Promise.all([
          fetch("/api/stats/overview").then(r => r.json()),
          fetch("/api/threats?limit=10&sort=detected_at&order=desc").then(r => r.json()),
        ]);

        setKpis([
          { label: "Transactions Scanned", value: formatNumber(statsRes.summary?.total_transactions || 487312), trend: "+12.8%", trendColor: C.resolved, period: "vs previous period", spark: [26, 32, 29, 33, 41, 44, 47], tone: C.brand },
          { label: "Total Violations", value: statsRes.summary?.total_threats || 168, trend: "+3.1%", trendColor: C.critical, period: "vs previous period", spark: [8, 10, 7, 11, 10, 12, 10], tone: C.critical },
          { label: "AML Confirmed", value: statsRes.summary?.total_threats ? Math.round(statsRes.summary.total_threats * 0.4) : 67, trend: "+8.4%", trendColor: C.resolved, period: "vs previous period", spark: [4, 4, 5, 6, 7, 7, 7], tone: C.resolved },
          { label: "SAR Required", value: statsRes.summary?.open_threats || 42, trend: "+1.9%", trendColor: C.high, period: "vs previous period", spark: [2, 3, 3, 4, 3, 4, 4], tone: C.high },
          { label: "Recall Rate", value: "80%", trend: "+2.5%", trendColor: C.resolved, period: "vs previous period", spark: [71, 72, 75, 76, 77, 79, 80], tone: C.ai },
          { label: "Compliance Score", value: "92%", trend: "+1.2%", trendColor: C.resolved, period: "vs previous period", spark: [88, 89, 90, 89, 91, 92, 92], tone: C.brand },
        ]);

        setRiskDistribution([
          { label: "Critical", value: 24, color: C.critical },
          { label: "High", value: 28, color: C.high },
          { label: "Medium", value: 18, color: C.medium },
          { label: "Low", value: 12, color: C.ai },
          { label: "Resolved", value: 18, color: C.resolved },
        ]);

        setOverviewSeries([42, 46, 44, 52, 58, 55, 61, 64, 68, 71, 70, 74]);
        
        if (threatsRes.data) {
          setThreats(threatsRes.data.map(t => ({
            ...t,
            riskScore: Math.round(t.confidence * 100),
            detected: formatRelative(t.detected_at),
            statusLabel: t.status.charAt(0).toUpperCase() + t.status.slice(1),
            amountValue: t.amount,
          })));
        }
      } catch (e) {
        console.error("Failed to load overview:", e);
        // Fallback to mock data
        setKpis([
          { label: "Transactions Scanned", value: formatNumber(487312), trend: "+12.8%", trendColor: C.resolved, period: "vs previous period", spark: [26, 32, 29, 33, 41, 44, 47], tone: C.brand },
          { label: "Total Violations", value: 168, trend: "+3.1%", trendColor: C.critical, period: "vs previous period", spark: [8, 10, 7, 11, 10, 12, 10], tone: C.critical },
          { label: "AML Confirmed", value: 67, trend: "+8.4%", trendColor: C.resolved, period: "vs previous period", spark: [4, 4, 5, 6, 7, 7, 7], tone: C.resolved },
          { label: "SAR Required", value: 42, trend: "+1.9%", trendColor: C.high, period: "vs previous period", spark: [2, 3, 3, 4, 3, 4, 4], tone: C.high },
          { label: "Recall Rate", value: "80%", trend: "+2.5%", trendColor: C.resolved, period: "vs previous period", spark: [71, 72, 75, 76, 77, 79, 80], tone: C.ai },
          { label: "Compliance Score", value: "92%", trend: "+1.2%", trendColor: C.resolved, period: "vs previous period", spark: [88, 89, 90, 89, 91, 92, 92], tone: C.brand },
        ]);
        setRiskDistribution([
          { label: "Critical", value: 24, color: C.critical },
          { label: "High", value: 28, color: C.high },
          { label: "Medium", value: 18, color: C.medium },
          { label: "Low", value: 12, color: C.ai },
          { label: "Resolved", value: 18, color: C.resolved },
        ]);
        setOverviewSeries([42, 46, 44, 52, 58, 55, 61, 64, 68, 71, 70, 74]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Inline components since they're used only here
  const DonutScoreLocal = ({ score, label, detail }) => {
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
  };

  const AnalyticsChartLocal = ({ title, values, tabValue, setTabValue, rangeValue, setRangeValue, color = C.brand, subtitle }) => {
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
  };

  const DistributionCardLocal = ({ values }) => (
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

  if (loading) {
    return (
      <div style={{ display: "grid", gap: 20 }}>
        <Card>
          <CardContent style={{ padding: 32, display: "grid", gap: 16 }}>
            <div className="skeleton" style={{ height: 32, width: "40%", borderRadius: C.radius }} />
            <div className="skeleton" style={{ height: 16, width: "60%", borderRadius: C.radius }} />
          </CardContent>
        </Card>
        <StatGrid stats={Array(6).fill({})} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Card className="skeleton" style={{ height: 320 }} />
          <Card className="skeleton" style={{ height: 320 }} />
        </div>
        <Card className="skeleton" style={{ height: 180 }} />
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Card>
        <CardContent style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ color: C.textDim, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Financial intelligence / AI-powered threat detection</div>
              <h1 style={{ margin: "8px 0 0", fontSize: 32, lineHeight: 1.1, letterSpacing: "-0.04em", color: C.text }}>AML Intelligence</h1>
              <p style={{ margin: "8px 0 0", color: C.textDim, fontSize: 14.5, maxWidth: 760 }}>AI-powered transaction monitoring and financial crime detection for compliance teams, investigators, and enterprise risk operations.</p>
            </div>
            <div style={{ display: "grid", gap: 10, justifyItems: "end" }}>
              <Tabs items={QUICK_FILTERS} value={selectedPeriod} onChange={setSelectedPeriod} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "end" }}>
                <Badge variant="soft" color={C.brand}>High Trust</Badge>
                <Badge variant="soft" color={C.ai}>AI Review</Badge>
                <Badge variant="soft" color={C.critical}>4 Critical</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <StatGrid stats={kpis} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <DonutScoreLocal score={38} label="High Risk" detail="Current model output across monitored windows and confirmed violations." />
        <AnalyticsChartLocal title="Transaction Risk Overview" subtitle="Switch between Transaction Volume, Risk Score, Violations, Confirmed Threats and SAR Cases." values={overviewSeries} tabValue={selectedRiskMetric} setTabValue={setSelectedRiskMetric} rangeValue={selectedPeriod} setRangeValue={setSelectedPeriod} color={C.brand} />
      </div>

      <DistributionCardLocal values={riskDistribution} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <CardHeader>
            <CardTitle>Active Threats</CardTitle>
            <CardDescription>Latest threats requiring attention</CardDescription>
          </CardHeader>
          <CardContent style={{ paddingTop: 8 }}>
            <table className="data-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Threat ID</th>
                  <th>Rule</th>
                  <th>Transaction</th>
                  <th>Amount</th>
                  <th>Risk</th>
                  <th>Detected</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {threats.slice(0, 5).map((row) => (
                  <tr key={row.id} className="table-row clickable" onClick={() => openThreat(row)}>
                    <td><Badge severity={row.severity} size="sm" /></td>
                    <td style={{ fontWeight: 700, color: C.text }}>{row.threat_id}</td>
                    <td style={{ color: C.textDim }}>{row.rule_id}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", color: C.text }}>{row.txn_id}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", color: C.text }}>{formatCurrency(row.amount)}</td>
                    <td style={{ color: C.text }}>{row.riskScore}%</td>
                    <td style={{ color: C.textDim }}>{row.detected}</td>
                    <td><Badge status={row.status} size="sm" /></td>
                    <td><Button variant="ghost" size="sm" tone="accent">Open</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <Button variant="outline" size="sm" onClick={() => setPage("threats")}>View all threats</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Insight</CardTitle>
            <CardDescription>Explainable AI output tailored for compliance analysts.</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 16 }}>
            <div className="card card-elevated" style={{ padding: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 12 }}>Suspicious layering pattern detected across 4 intermediary accounts.</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginTop: 16 }}>
                <div><div style={{ color: C.textDim, fontSize: 12 }}>Risk probability</div><div style={{ color: C.critical, fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em" }}>94%</div></div>
                <div><div style={{ color: C.textDim, fontSize: 12 }}>Estimated exposure</div><div style={{ color: C.text, fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em" }}>{formatCurrency(75000)}</div></div>
              </div>
            </div>
            {["Transaction layering", "High velocity", "Unusual routing", "Structuring behavior"].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, color: C.text }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.brand }} />{item}
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
              <Button tone="accent">Investigate</Button>
              <Button variant="outline" tone="brand">Create Case</Button>
              <Button variant="outline" tone="slate">Generate Report</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Network</CardTitle>
          <CardDescription>Interactive graph — click nodes to inspect connections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="card graph-shell" style={{ padding: 16, minHeight: 360, background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)" }}>
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `linear-gradient(${C.border}66 1px, transparent 1px), linear-gradient(90deg, ${C.border}66 1px, transparent 1px)`, backgroundSize: "48px 48px", opacity: 0.28 }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <NetworkGraphPreview onExplain={() => openThreat(threats[3])} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Mini network graph for overview
function NetworkGraphPreview({ onExplain }) {
  const nodes = [
    { id: "ACC-2200", x: 124, y: 118, risk: C.critical },
    { id: "ACC-6650", x: 244, y: 96, risk: C.high },
    { id: "ACC-7712", x: 346, y: 162, risk: C.critical },
    { id: "ACC-3301", x: 450, y: 92, risk: C.high },
    { id: "ACC-9982", x: 560, y: 170, risk: C.resolved },
    { id: "ACC-1190", x: 286, y: 262, risk: C.medium },
    { id: "ACC-8840", x: 420, y: 278, risk: C.high },
  ];
  const links = [[0, 1], [1, 2], [2, 3], [1, 5], [5, 6], [2, 4], [0, 5]];

  return (
    <div style={{ width: "100%", height: 340 }}>
      <svg viewBox="0 0 680 360" style={{ width: "100%", height: "auto" }}>
        <defs>
          <marker id="arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5" fill={C.borderLight} />
          </marker>
        </defs>
        {links.map(([a, b], idx) => {
          const n1 = nodes[a];
          const n2 = nodes[b];
          const highlighted = idx === 1 || idx === 2;
          return (
            <line
              key={idx}
              x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
              stroke={highlighted ? C.brand : C.borderLight}
              strokeWidth={highlighted ? 3 : 2}
              strokeDasharray={idx === 2 ? "5 4" : "0"}
              opacity={highlighted ? 0.9 : 0.5}
              strokeLinecap="round"
              markerEnd="url(#arrow)"
            />
          );
        })}
        {nodes.map((node) => (
          <g key={node.id} style={{ cursor: "pointer" }}>
            <circle cx={node.x} cy={node.y} r={16} fill="#fff" stroke={node.risk} strokeWidth="2.5" />
            <circle cx={node.x} cy={node.y} r="4" fill={node.risk} />
            <text x={node.x} y={node.y + 34} textAnchor="middle" fontSize="12" fill={C.text} fontWeight="600" style={{ fontFamily: "'Inter', sans-serif" }}>{node.id}</text>
          </g>
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", color: C.textDim, fontSize: 12, marginTop: 8 }}>
        <span>Suspicious cluster highlighted in blue.</span>
        <Button variant="ghost" size="sm" tone="accent" onClick={onExplain}>Explain Network</Button>
      </div>
    </div>
  );
}

export default OverviewView;