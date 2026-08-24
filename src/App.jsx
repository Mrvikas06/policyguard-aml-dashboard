import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { VIOLATIONS, LIVE_TXNS, AML_RULES, HIGH_RISK_PAIRS, DB_TABLES } from "./data/violations";
import { C, GLOBAL_CSS, SEVER, STATUS } from "./theme/colors";
import { Toast } from "./components/ui/Toast";
import { Badge } from "./components/ui/Badge";
import { Button } from "./components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/Card";
import { Input } from "./components/ui/Input";
import { Select } from "./components/ui/Select";
import { Progress } from "./components/ui/Progress";
import { Tabs } from "./components/ui/Tabs";
import { Avatar } from "./components/ui/Avatar";
import { Separator } from "./components/ui/Separator";

const NAV_GROUPS = [
  { label: "Platform", items: [{ id: "overview", label: "Overview", note: "Executive snapshot" }] },
  { label: "Threat Intelligence", items: [{ id: "threats", label: "Threats", note: "Open investigations" }, { id: "transactions", label: "Transactions", note: "Search and filter" }, { id: "network", label: "Network", note: "Trace connected flows" }] },
  { label: "Compliance", items: [{ id: "policies", label: "Policies", note: "Rule operations" }, { id: "cases", label: "SAR Cases", note: "Review workflow" }, { id: "reports", label: "Reports", note: "Generate and export" }] },
  { label: "AI Tools", items: [{ id: "scanner", label: "AI Scanner", note: "Batch monitoring" }, { id: "sentinel", label: "Sentinel", note: "Live system health" }, { id: "investigation", label: "AI Investigation", note: "Explainable reasoning" }] },
  { label: "System", items: [{ id: "audit", label: "Audit Log", note: "Recent activity" }, { id: "settings", label: "Settings", note: "Workspace controls" }] },
];

const QUICK_FILTERS = ["Today", "24 hours", "7 days", "30 days", "Custom"];

const RISK_TABS = ["Transaction Volume", "Risk Score", "Violations", "Confirmed Threats", "SAR Cases"];
const REPORT_TYPES = ["AML Summary", "Threat Report", "Transaction Report", "Compliance Report", "SAR Report", "AI Risk Report"];
const CASE_STATUSES = ["New", "Investigating", "Escalated", "Awaiting Review", "Resolved", "False Positive"];

const numberFmt = new Intl.NumberFormat("en-US");
const moneyFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const baseThreats = VIOLATIONS.map((item, index) => ({
  ...item,
  riskScore: Math.max(55, Math.round(item.confidence * 100)),
  detected: item.time,
  statusLabel: item.status === "reviewing" ? "Investigating" : item.status === "resolved" ? "Resolved" : "Open",
  amountValue: item.amount,
  detectedMinutes: [2, 4, 9, 12, 18, 22, 35, 60, 180, 300][index] ?? 15,
}));

const caseSeed = [
  { id: "CASE-1042", status: "Investigating", analyst: "M. Patel", score: 94, threats: ["V-004", "V-001"], updated: "12m ago", notes: "Layering cluster across 4 intermediary accounts." },
  { id: "CASE-1043", status: "Awaiting Review", analyst: "A. Chen", score: 88, threats: ["V-002", "V-006"], updated: "34m ago", notes: "Velocity burst with repeated beneficiaries." },
  { id: "CASE-1044", status: "Escalated", analyst: "S. Gomez", score: 91, threats: ["V-003"], updated: "1h ago", notes: "Structuring across multiple cash-outs." },
  { id: "CASE-1045", status: "Resolved", analyst: "L. Khan", score: 72, threats: ["V-009", "V-010"], updated: "3h ago", notes: "SAR filed and monitoring retained." },
];

const auditLog = [
  { time: "09:41", action: "Threat V-004 escalated to case CASE-1042", actor: "Automated Rules Engine" },
  { time: "09:37", action: "SAR draft generated for V-009", actor: "AI Assistant" },
  { time: "09:29", action: "Policy R-013 test executed — 98.2% precision", actor: "Compliance Ops" },
  { time: "09:18", action: "User Meredith approved case CASE-1045", actor: "Analyst" },
];

const PROFILE_PERMISSIONS = [
  {
    key: "editUserInfo",
    label: "Edit user info",
    description: "Allow profile fields, title, and contact details to be updated.",
  },
  {
    key: "exportReports",
    label: "Export reports",
    description: "Allow downloading and sharing of compliance reports.",
  },
  {
    key: "managePolicies",
    label: "Manage policies",
    description: "Allow policy creation, edits, and rule lifecycle changes.",
  },
  {
    key: "assignCases",
    label: "Assign cases",
    description: "Allow routing of cases to analysts and reviewers.",
  },
];

const INITIAL_PROFILE = {
  name: "Meredith Lane",
  title: "Compliance Lead",
  email: "meredith.lane@policyguard.ai",
  team: "AML Operations",
  location: "New York, US",
  timezone: "ET (UTC-05:00)",
  permissions: {
    editUserInfo: true,
    exportReports: true,
    managePolicies: false,
    assignCases: true,
  },
};

function BrandMark({ size = 34 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id="pg-brand" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={C.brand} />
          <stop offset="100%" stopColor={C.brandHover} />
        </linearGradient>
      </defs>
      <path d="M20 12h18c8.8 0 16 7.2 16 16s-7.2 16-16 16H30v8H20V12zm10 10v12h7.5c3.3 0 6-2.7 6-6s-2.7-6-6-6H30z" fill="url(#pg-brand)" />
      <path d="M32 8 49 16v16c0 10.8-8 18-17 24-9-6-17-13.2-17-24V16l17-8z" fill="none" stroke="url(#pg-brand)" strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="22" cy="26" r="2.2" fill="#fff" opacity="0.95" />
      <circle cx="42" cy="20" r="2.2" fill="#fff" opacity="0.95" />
      <circle cx="45" cy="42" r="2.2" fill="#fff" opacity="0.95" />
    </svg>
  );
}

function SectionHeading({ eyebrow, title, description, actions }) {
  return (
    <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
      <div>
        {eyebrow && <div style={{ color: C.brand, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{eyebrow}</div>}
        <h2 style={{ margin: 0, fontSize: 22, lineHeight: 1.15, letterSpacing: "-0.03em", color: C.text }}>{title}</h2>
        {description && <p style={{ margin: "6px 0 0", color: C.text2, fontSize: 13, lineHeight: 1.5, maxWidth: 760 }}>{description}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}

function Sparkline({ values, color = C.brand }) {
  const w = 100;
  const h = 32;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const coordinates = values.map((v, i) => ({
    x: (i / (values.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 4) - 2,
  }));
  const points = coordinates.map((point) => `${point.x},${point.y}`).join(" ");
  const fillPoints = `${points} ${w},${h} 0,${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 32, overflow: "visible" }}>
      <polygon points={fillPoints} fill={color} opacity="0.08" />
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={coordinates.at(-1)?.x ?? w} cy={coordinates.at(-1)?.y ?? h / 2} r="2.8" fill={color} />
    </svg>
  );
}

function DonutScore({ score, label, detail }) {
  const radius = 42;
  const stroke = 10;
  const normalized = Math.min(100, Math.max(0, score));
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalized / 100) * circumference;

  return (
    <div className="soft-card" style={{ padding: 20, height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>AML Risk Score</div>
          <div style={{ color: C.text2, fontSize: 13, marginTop: 3 }}>{detail}</div>
        </div>
        <Badge col={score >= 70 ? C.critical : score >= 50 ? C.high : score >= 30 ? C.medium : C.resolved} sm>{label}</Badge>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 20, alignItems: "center" }}>
        <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto" }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke={C.panelAlt} strokeWidth={stroke} />
            <circle cx="60" cy="60" r={radius} fill="none" stroke={score >= 70 ? C.critical : score >= 50 ? C.high : score >= 30 ? C.medium : C.resolved} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 60 60)" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", color: C.text }}>{normalized}%</div>
            <div style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>{label}</div>
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
                <span style={{ color: C.text2 }}>{item.label}</span>
                <span style={{ color: item.color, fontWeight: 700 }}>{item.value}</span>
              </div>
              <Progress value={item.label === "Critical" ? 82 : item.label === "High" ? 68 : item.label === "Resolved" ? 54 : 78} color={item.color} height={7} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsChart({ title, values, tabValue, setTabValue, rangeValue, setRangeValue, color = C.brand, subtitle }) {
  const w = 840;
  const h = 280;
  const padX = 30;
  const padY = 26;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const latest = values.at(-1) ?? 0;
  const previous = values.at(-2) ?? latest;
  const average = values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
  const delta = latest - previous;
  const deltaPct = previous === 0 ? 0 : (delta / previous) * 100;
  const coordinates = values.map((v, i) => {
    const x = padX + (i / Math.max(values.length - 1, 1)) * (w - padX * 2);
    const y = padY + (1 - (v - min) / range) * (h - padY * 2);
    return { x, y, v };
  });
  const points = coordinates.map((point) => `${point.x},${point.y}`).join(" ");
  const fillPoints = `${points} ${w - padX},${h - padY} ${padX},${h - padY}`;
  const statTiles = [
    { label: "Current", value: numberFmt.format(latest), tone: color },
    { label: "Average", value: numberFmt.format(Math.round(average)), tone: C.text2 },
    { label: "Peak", value: numberFmt.format(max), tone: C.high },
  ];

  return (
    <div className="soft-card analytics-shell" style={{ padding: 20, height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <div style={{ color: C.text, fontSize: 16, fontWeight: 700 }}>{title}</div>
          <div style={{ color: C.text2, fontSize: 13, marginTop: 3 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <Tabs items={RISK_TABS} value={tabValue} onChange={setTabValue} />
          <Tabs items={["Today", "7D", "30D", "90D"]} value={rangeValue} onChange={setRangeValue} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        {statTiles.map((item) => (
          <div key={item.label} style={{ padding: 12, borderRadius: 14, border: `1px solid ${C.border}`, background: C.panelAlt, display: "grid", gap: 6 }}>
            <div style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{item.label}</div>
            <div style={{ color: item.tone, fontSize: 24, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>{item.value}</div>
          </div>
        ))}
      </div>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 16, background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)", padding: 16 }}>
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
                <text x={10} y={y} fill={C.text2} fontSize="10" dominantBaseline="middle" textAnchor="start">
                  {numberFmt.format(Math.round(valueAtLine))}
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
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, color: C.text2, fontSize: 12, gap: 12, flexWrap: "wrap" }}>
        <span>Enterprise trend line with the current window emphasized.</span>
        <span>{rangeValue} · avg {numberFmt.format(Math.round(average))} · Δ {delta >= 0 ? "+" : ""}{deltaPct.toFixed(1)}%</span>
      </div>
    </div>
  );
}

function DistributionCard({ values }) {
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
              <span className="text-mono" style={{ color: C.text2 }}>{item.value}%</span>
            </div>
            <Progress value={item.value} color={item.color} height={10} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function StatCard({ label, value, trend, period, spark, tone = C.brand, trendTone = C.text2 }) {
  const displayValue = typeof value === "number" ? numberFmt.format(value) : value;
  const deltaTone = trendTone || (trend.startsWith("+") ? C.resolved : C.critical);

  return (
    <div className="metric-card" style={{ padding: 0, overflow: "hidden", minHeight: 156 }}>
      <div style={{ height: 4, background: tone }} />
      <div style={{ padding: 18, display: "grid", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
              <div style={{ color: C.text, fontSize: 30, fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1 }}>{displayValue}</div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 9px", borderRadius: 999, background: `${deltaTone}10`, color: deltaTone, border: `1px solid ${deltaTone}24`, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                {trend}
              </span>
            </div>
            <div style={{ color: C.text2, fontSize: 12, marginTop: 6 }}>{period}</div>
          </div>
          <div style={{ width: 100, alignSelf: "flex-start" }}>
            <Sparkline values={spark} color={tone} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ThreatBadge({ severity }) {
  const s = SEVER[severity] || SEVER.medium;
  return <Badge col={s.col} sm>{s.lbl}</Badge>;
}

function ThreatTable({ data, onOpenThreat, page: pageProp, setPage: setPageProp, title = "Active Threats", viewAllLabel = "View all threats", rowsPerPage = 5 }) {
  const [localPage, setLocalPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
  const page = Math.min(Math.max(1, pageProp ?? localPage), totalPages);
  const gotoPage = (next) => {
    const target = Math.min(Math.max(1, next), totalPages);
    if (setPageProp) setPageProp(target);
    else setLocalPage(target);
  };
  const slice = data.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Card>
      <CardHeader>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Rows support hover, click-to-open investigation, sorting, filtering and pagination.</CardDescription>
          </div>
          <Button variant="outline" tone="slate">{viewAllLabel}</Button>
        </div>
      </CardHeader>
      <CardContent style={{ paddingTop: 8 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr>
                {["Severity", "Threat ID", "Rule", "Transaction", "Amount", "Risk Score", "Detected", "Status", "Action"].map((heading) => (
                  <th key={heading} style={{ textAlign: "left", padding: "12px 10px", fontSize: 12, color: C.text2, fontWeight: 700, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.map((row) => (
                <tr key={row.id} className="table-row" onClick={() => onOpenThreat(row)} style={{ cursor: "pointer" }}>
                  <td style={{ padding: "14px 10px", borderBottom: `1px solid ${C.border}` }}><ThreatBadge severity={row.severity} /></td>
                  <td style={{ padding: "14px 10px", borderBottom: `1px solid ${C.border}`, fontWeight: 700, color: C.text }}>{row.id}</td>
                  <td style={{ padding: "14px 10px", borderBottom: `1px solid ${C.border}`, color: C.text2 }}>{row.rule}</td>
                  <td style={{ padding: "14px 10px", borderBottom: `1px solid ${C.border}`, fontFamily: "Geist Mono, ui-monospace, monospace", color: C.text }}>{row.txn}</td>
                  <td style={{ padding: "14px 10px", borderBottom: `1px solid ${C.border}`, fontFamily: "Geist Mono, ui-monospace, monospace", color: C.text }}>{moneyFmt.format(row.amount)}</td>
                  <td style={{ padding: "14px 10px", borderBottom: `1px solid ${C.border}`, color: C.text }}>{row.riskScore}</td>
                  <td style={{ padding: "14px 10px", borderBottom: `1px solid ${C.border}`, color: C.text2 }}>{row.detected}</td>
                  <td style={{ padding: "14px 10px", borderBottom: `1px solid ${C.border}` }}><Badge col={STATUS[row.statusLabel === "Resolved" ? "resolved" : row.statusLabel === "Investigating" ? "investigating" : "open"].col} sm>{row.statusLabel}</Badge></td>
                  <td style={{ padding: "14px 10px", borderBottom: `1px solid ${C.border}` }}><Button variant="ghost" tone="teal">Open</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, gap: 12, flexWrap: "wrap" }}>
          <div style={{ color: C.text2, fontSize: 13 }}>Page {page} of {totalPages}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outline" tone="slate" onClick={() => gotoPage(page - 1)} disabled={page <= 1}>Previous</Button>
            <Button variant="outline" tone="slate" onClick={() => gotoPage(page + 1)} disabled={page >= totalPages}>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NetworkGraph({ onExplain, selectedNode: externalSelected, onSelectNode }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [internalSelected, setInternalSelected] = useState("ACC-7712");
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
  const isControlled = externalSelected !== undefined;
  const selectedNode = isControlled ? externalSelected : internalSelected;
  const selectNode = (id) => {
    if (!isControlled) setInternalSelected(id);
    if (onSelectNode) onSelectNode(id);
  };
  const activeNodeId = hoveredNode || selectedNode || nodes[2].id;
  const activeNode = nodes.find((node) => node.id === activeNodeId) || nodes[2];
  const activeConnections = links.filter(([a, b]) => nodes[a].id === activeNodeId || nodes[b].id === activeNodeId).length;
  const focusIds = new Set([activeNodeId]);

  links.forEach(([a, b]) => {
    const source = nodes[a].id;
    const target = nodes[b].id;
    if (source === activeNodeId || target === activeNodeId) {
      focusIds.add(source);
      focusIds.add(target);
    }
  });

  const riskLabel = activeNode.risk === C.critical ? "Critical" : activeNode.risk === C.high ? "High" : activeNode.risk === C.medium ? "Medium" : "Resolved";
  const routeLabel = activeNodeId === "ACC-2211" ? "Circular loop" : activeNodeId === "ACC-3344" ? "Fan-out cluster" : activeNodeId === "ACC-2200" ? "Layered path" : "Connected path";
  const graphStats = [
    { label: "Nodes", value: nodes.length, tone: C.brand },
    { label: "Connected links", value: activeConnections, tone: C.high },
    { label: "Exposure", value: moneyFmt.format(75000), tone: C.critical },
    { label: "Selected route", value: routeLabel, tone: C.text2 },
  ];

  return (
    <Card>
      <CardHeader>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <CardTitle>Transaction Network</CardTitle>
            <CardDescription>Zoom, pan, node selection, amount direction and risk highlighting, presented as an analyzable network map.</CardDescription>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Input placeholder="Search account or node..." style={{ minWidth: 220 }} />
            <Button tone="teal" onClick={onExplain}>Explain this network</Button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginTop: 14 }}>
          {graphStats.map((item) => (
            <div key={item.label} style={{ padding: 12, borderRadius: 14, border: `1px solid ${C.border}`, background: C.panelAlt, display: "grid", gap: 6 }}>
              <div style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{item.label}</div>
              <div style={{ color: item.tone, fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}>{typeof item.value === "number" ? numberFmt.format(item.value) : item.value}</div>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="network-split" style={{ display: "grid", gap: 16, alignItems: "start" }}>
          <div className="soft-card graph-shell" style={{ padding: 16, minHeight: 380, position: "relative", background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)" }}>
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `linear-gradient(${C.border}66 1px, transparent 1px), linear-gradient(90deg, ${C.border}66 1px, transparent 1px)`, backgroundSize: "48px 48px", opacity: 0.28 }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <Badge col={C.brand} sm>Active cluster</Badge>
                <Badge col={C.high} sm>Layering</Badge>
                <Badge col={C.ai} sm>Explainable AI</Badge>
                <Badge col={C.text2} sm>Live trace</Badge>
              </div>
              <svg viewBox="0 0 680 360" style={{ width: "100%", height: "auto" }}>
                <defs>
                  <marker id="network-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                    <path d="M0,0 L5,2.5 L0,5" fill={C.borderHi} />
                  </marker>
                </defs>
                {links.map(([a, b], idx) => {
                  const n1 = nodes[a];
                  const n2 = nodes[b];
                  const connected = n1.id === activeNodeId || n2.id === activeNodeId;
                  const focused = focusIds.has(n1.id) && focusIds.has(n2.id);
                  return (
                    <line
                      key={idx}
                      x1={n1.x}
                      y1={n1.y}
                      x2={n2.x}
                      y2={n2.y}
                      stroke={connected ? C.brand : focused ? C.borderHi : C.border}
                      strokeWidth={connected ? 3 : 2}
                      strokeDasharray={idx === 2 ? "5 4" : "0"}
                      opacity={connected ? 0.96 : focused ? 0.8 : 0.42}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      markerEnd="url(#network-arrow)"
                    />
                  );
                })}
                {nodes.map((node) => {
                  const active = activeNodeId === node.id;
                  const related = focusIds.has(node.id);
                  const tone = active ? C.brand : node.risk;
                  return (
                    <g
                      key={node.id}
                      onClick={() => selectNode(node.id)}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          selectNode(node.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Inspect ${node.id}`}
                      style={{ cursor: "pointer" }}
                    >
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={active ? 22 : related ? 18 : 14}
                        fill={active ? `${C.brand}16` : "#fff"}
                        stroke={active ? C.brand : tone}
                        strokeWidth={active ? 3.5 : related ? 3 : 2.5}
                      />
                      <circle cx={node.x} cy={node.y} r={active ? 5 : 4} fill={tone} />
                      <text
                        x={node.x}
                        y={node.y + 35}
                        textAnchor="middle"
                        fontSize={active ? "12.5" : "11.5"}
                        fill={active ? C.text : C.text2}
                        fontWeight={active ? "700" : "600"}
                        style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.01em" }}
                      >
                        {node.id}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", color: C.text2, fontSize: 12, marginTop: 8, gap: 12, flexWrap: "wrap" }}>
                <span>Suspicious cluster highlighted in blue.</span>
                <span>Hover or select nodes to inspect connected accounts.</span>
              </div>
            </div>
          </div>
          <div className="soft-card" style={{ padding: 16, display: "grid", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ color: C.text, fontSize: 16, fontWeight: 700 }}>Account Details</div>
                <div style={{ color: C.text2, fontSize: 13, marginTop: 4 }}>Focused node: {activeNodeId}</div>
              </div>
              <Badge col={activeNode.risk} sm>{riskLabel}</Badge>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
              {[
                { label: "Connectivity", value: `${activeConnections} links` },
                { label: "Route", value: routeLabel },
                { label: "Risk posture", value: riskLabel },
                { label: "Exposure", value: moneyFmt.format(75000) },
              ].map((item) => (
                <div key={item.label} style={{ padding: 12, borderRadius: 14, border: `1px solid ${C.border}`, background: C.panelAlt, display: "grid", gap: 6 }}>
                  <div style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{item.label}</div>
                  <div style={{ color: C.text, fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {[
                { label: "Related accounts", value: `${activeConnections + 1} observed` },
                { label: "Directionality", value: activeNodeId === "ACC-2211" ? "Circular" : "Inbound / outbound" },
                { label: "Case status", value: activeNode.risk === C.resolved ? "Resolved" : "Open" },
                { label: "AI confidence", value: "97%" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: `1px solid ${C.border}` }}>
                  <span style={{ color: C.text2, fontSize: 13 }}>{item.label}</span>
                  <span style={{ color: C.text, fontWeight: 700 }}>{item.value}</span>
                </div>
              ))}
            </div>
            <Button tone="teal">Generate path explanation</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Header({ search, setSearch, dateFilter, setDateFilter, timeLabel, onMenuClick, profile, onEditProfile }) {
  return (
    <header className="topbar-shell" style={{ position: "sticky", top: 0, zIndex: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", maxWidth: 1600, margin: "0 auto", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: "1 1 360px", minWidth: 0 }}>
          <Button variant="secondary" tone="slate" onClick={onMenuClick} style={{ display: "none", flexShrink: 0 }} className="mobile-only" aria-label="Open navigation">
            ☰
          </Button>
          <div style={{ display: "grid", gap: 8, flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Production workspace</div>
              <Badge col={C.brand} sm>Live</Badge>
            </div>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transactions, accounts, threats..." style={{ width: "100%", maxWidth: 620 }} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end", flex: "0 1 auto", marginLeft: "auto" }}>
          <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ width: 148 }}>
            <option>Last 24 hours</option>
            <option>Today</option>
            <option>7 days</option>
            <option>30 days</option>
          </Select>
          <Badge col={C.ai}>Live · {timeLabel}</Badge>
          <Button variant="secondary" tone="slate" aria-label="Help">?</Button>
          <Button variant="secondary" tone="slate" aria-label="Notifications">🔔</Button>
          <button type="button" className="profile-button" onClick={onEditProfile} aria-label="Edit user profile">
            <Avatar name={profile.name} />
            <div style={{ lineHeight: 1.2, minWidth: 0, textAlign: "left" }}>
              <div style={{ fontWeight: 800, color: C.text, fontSize: 13 }}>{profile.name}</div>
              <div style={{ color: C.text2, fontSize: 12 }}>{profile.title}</div>
            </div>
            <Badge col={profile.permissions.editUserInfo ? C.resolved : C.muted} sm>{profile.permissions.editUserInfo ? "Editable" : "Locked"}</Badge>
            <span style={{ color: C.brand, fontSize: 12, fontWeight: 800 }}>Edit</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ page, setPage, embedded = false }) {
  const activeGroup = NAV_GROUPS.find((group) => group.items.some((item) => item.id === page)) || NAV_GROUPS[0];
  const activeItem = activeGroup.items.find((item) => item.id === page) || activeGroup.items[0];

  return (
    <aside
      className="sidebar-shell"
      style={{
        width: 256,
        minHeight: embedded ? "auto" : "100vh",
        position: embedded ? "relative" : "sticky",
        top: embedded ? "auto" : 0,
        alignSelf: "start",
      }}
    >
      <div style={{ padding: 20, display: "grid", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <BrandMark size={36} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.03em", color: C.text }}>POLICYGUARD AI</div>
            <div style={{ color: C.text2, fontSize: 12 }}>AI-powered financial threat intelligence</div>
          </div>
        </div>
        <div className="soft-card-elevated" style={{ padding: 14, display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
            <div>
              <div style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Workspace</div>
              <div style={{ color: C.text, fontSize: 15, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 4 }}>Compliance command center</div>
            </div>
            <Badge col={C.brand} sm>{embedded ? "Drawer" : "Live"}</Badge>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
            <div style={{ padding: 12, borderRadius: 12, background: C.panelAlt, border: `1px solid ${C.border}` }}>
              <div style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Active page</div>
              <div style={{ color: C.text, fontSize: 13, fontWeight: 700, marginTop: 6 }}>{activeItem.label}</div>
            </div>
            <div style={{ padding: 12, borderRadius: 12, background: C.panelAlt, border: `1px solid ${C.border}` }}>
              <div style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Section</div>
              <div style={{ color: C.text, fontSize: 13, fontWeight: 700, marginTop: 6 }}>{activeGroup.label}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge col={C.ai} sm>Realtime</Badge>
            <Badge col={C.high} sm>AML Ops</Badge>
          </div>
        </div>
        <Separator />
        <div style={{ display: "grid", gap: 16 }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "0 8px" }}>
                <div style={{ color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{group.label}</div>
                <Badge col={C.text2} sm variant="outline">{group.items.length}</Badge>
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`nav-item ${page === item.id ? "nav-item-active" : ""}`}
                    aria-current={page === item.id ? "page" : undefined}
                    onClick={() => setPage(item.id)}
                    style={{ alignItems: "flex-start", gap: 10, padding: "11px 12px" }}
                  >
                    <span style={{ width: 4, alignSelf: "stretch", borderRadius: 999, background: page === item.id ? C.brand : "transparent", flexShrink: 0 }} />
                    <span style={{ display: "grid", gap: 2, minWidth: 0, flex: 1 }}>
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: page === item.id ? 700 : 600, color: page === item.id ? C.text : C.text2 }}>{item.label}</span>
                        {page === item.id && <span style={{ fontSize: 11, fontWeight: 700, color: C.brand }}>Current</span>}
                      </span>
                      {item.note && <span style={{ fontSize: 12, color: page === item.id ? C.text2 : C.muted, lineHeight: 1.35 }}>{item.note}</span>}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function ProfileEditorModal({ open, profile, draft, setDraft, onClose, onSave }) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const updateField = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const togglePermission = (key) => {
    setDraft((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="profile-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="profile-modal-head">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start", flexWrap: "wrap" }}>
            <div>
              <div style={{ color: C.brand, fontSize: 11, fontWeight: 800, letterSpacing: "0.09em", textTransform: "uppercase" }}>User access</div>
              <h3 id="profile-modal-title" style={{ margin: "8px 0 0", color: C.text, fontSize: 22, lineHeight: 1.15, letterSpacing: "-0.03em" }}>Edit profile and permissions</h3>
              <div style={{ marginTop: 6, color: C.text2, fontSize: 13, lineHeight: 1.5 }}>Changes update the header, settings panel, and access badges instantly.</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <Badge col={profile.permissions.editUserInfo ? C.resolved : C.muted} sm>{profile.permissions.editUserInfo ? "Edit access on" : "Edit access off"}</Badge>
              <Badge col={C.violet} sm>Modern UI</Badge>
            </div>
          </div>
        </div>

        <div style={{ padding: 24, display: "grid", gap: 18 }}>
          <div className="profile-modal-grid">
            <div style={{ display: "grid", gap: 14 }}>
              <div className="soft-card-elevated" style={{ padding: 18, display: "grid", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ color: C.text, fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>Profile details</div>
                    <div style={{ color: C.text2, fontSize: 13, marginTop: 4 }}>Keep identity, role, and workspace contact info current.</div>
                  </div>
                  <Avatar name={draft.name} style={{ width: 48, height: 48, borderRadius: 16 }} />
                </div>
                <div className="profile-field-grid">
                  <Input value={draft.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Full name" />
                  <Input value={draft.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Job title" />
                  <Input value={draft.email} onChange={(event) => updateField("email", event.target.value)} placeholder="Email address" />
                  <Input value={draft.team} onChange={(event) => updateField("team", event.target.value)} placeholder="Team or function" />
                </div>
                <div className="profile-field-grid">
                  <Input value={draft.location} onChange={(event) => updateField("location", event.target.value)} placeholder="Location" />
                  <Select value={draft.timezone} onChange={(event) => updateField("timezone", event.target.value)}>
                    <option>ET (UTC-05:00)</option>
                    <option>CT (UTC-06:00)</option>
                    <option>MT (UTC-07:00)</option>
                    <option>PT (UTC-08:00)</option>
                    <option>IST (UTC+05:30)</option>
                    <option>GMT (UTC+00:00)</option>
                  </Select>
                </div>
              </div>

              <div className="soft-card" style={{ padding: 18, display: "grid", gap: 12 }}>
                <div style={{ color: C.text, fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>Preview</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {[
                    { label: "Name", value: draft.name },
                    { label: "Title", value: draft.title },
                    { label: "Email", value: draft.email },
                    { label: "Team", value: draft.team },
                    { label: "Location", value: draft.location },
                    { label: "Timezone", value: draft.timezone },
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", gap: 12, color: C.text, fontSize: 13 }}>
                      <span style={{ color: C.text2 }}>{item.label}</span>
                      <span style={{ fontWeight: 700, textAlign: "right" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <div className="soft-card-elevated" style={{ padding: 18, display: "grid", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ color: C.text, fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>Permissions</div>
                    <div style={{ color: C.text2, fontSize: 13, marginTop: 4 }}>Toggle what this user can change inside the workspace.</div>
                  </div>
                  <Badge col={C.ai} sm>Role control</Badge>
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  {PROFILE_PERMISSIONS.map((permission) => {
                    const active = Boolean(draft.permissions[permission.key]);
                    return (
                      <button
                        key={permission.key}
                        type="button"
                        className="permission-card"
                        data-on={active}
                        onClick={() => togglePermission(permission.key)}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                          <span style={{ color: C.text, fontSize: 14, fontWeight: 700 }}>{permission.label}</span>
                          <Badge col={active ? C.resolved : C.text2} sm>{active ? "Enabled" : "Disabled"}</Badge>
                        </div>
                        <div style={{ color: C.text2, fontSize: 12, lineHeight: 1.5 }}>{permission.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="soft-card" style={{ padding: 18, display: "grid", gap: 10 }}>
                <div style={{ color: C.text, fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>Access summary</div>
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, color: C.text, fontSize: 13 }}>
                    <span>Editable profile</span>
                    <span style={{ fontWeight: 700, color: draft.permissions.editUserInfo ? C.resolved : C.muted }}>{draft.permissions.editUserInfo ? "Allowed" : "Restricted"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, color: C.text, fontSize: 13 }}>
                    <span>Analyst tools</span>
                    <span style={{ fontWeight: 700, color: draft.permissions.assignCases ? C.brand : C.muted }}>{draft.permissions.assignCases ? "Enabled" : "Limited"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, color: C.text, fontSize: 13 }}>
                    <span>Policy editor</span>
                    <span style={{ fontWeight: 700, color: draft.permissions.managePolicies ? C.brand : C.muted }}>{draft.permissions.managePolicies ? "Enabled" : "Off"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ color: C.text2, fontSize: 13 }}>Last synced with the live workspace for {profile.name}.</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button variant="outline" tone="slate" onClick={onClose}>Cancel</Button>
              <Button tone="violet" onClick={onSave}>Save changes</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileDrawer({ open, onClose, page, setPage }) {
  if (!open) return null;

  return (
    <div className="mobile-drawer-overlay" onClick={onClose}>
      <div className="mobile-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 16px 8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BrandMark size={30} />
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>POLICYGUARD AI</div>
          </div>
          <Button variant="secondary" tone="slate" onClick={onClose}>✕</Button>
        </div>
        <div style={{ borderTop: `1px solid ${C.border}` }} />
        <div style={{ maxHeight: "calc(100vh - 78px)", overflowY: "auto" }}>
          <Sidebar page={page} setPage={(nextPage) => { setPage(nextPage); onClose(); }} embedded />
        </div>
      </div>
    </div>
  );
}

function StatGrid({ stats }) {
  return (
    <div className="metric-grid kpi-grid stagger-grid" style={{ display: "grid", gap: 14 }}>
      {stats.map((s) => <StatCard key={s.label} {...s} />)}
    </div>
  );
}

function OverviewPage({ openThreat, threatPage, setThreatPage, selectedPeriod, setSelectedPeriod, selectedRiskMetric, setSelectedRiskMetric }) {
  const overviewSeries = [42, 46, 44, 52, 58, 55, 61, 64, 68, 71, 70, 74];
  const kpis = [
    { label: "Transactions Scanned", value: numberFmt.format(487312), trend: "+12.8%", trendTone: C.resolved, period: "vs previous period", spark: [26, 32, 29, 33, 41, 44, 47], tone: C.brand },
    { label: "Total Violations", value: 10, trend: "+3.1%", trendTone: C.critical, period: "vs previous period", spark: [8, 10, 7, 11, 10, 12, 10], tone: C.critical },
    { label: "AML Confirmed", value: 7, trend: "+8.4%", trendTone: C.critical, period: "vs previous period", spark: [4, 4, 5, 6, 7, 7, 7], tone: C.resolved },
    { label: "SAR Required", value: 4, trend: "+1.9%", trendTone: C.high, period: "vs previous period", spark: [2, 3, 3, 4, 3, 4, 4], tone: C.high },
    { label: "Recall Rate", value: "80%", trend: "+2.5%", trendTone: C.resolved, period: "vs previous period", spark: [71, 72, 75, 76, 77, 79, 80], tone: C.ai },
    { label: "Compliance Score", value: "92%", trend: "+1.2%", trendTone: C.resolved, period: "vs previous period", spark: [88, 89, 90, 89, 91, 92, 92], tone: C.brand },
  ];

  const riskDistribution = [
    { label: "Critical", value: 24, color: C.critical },
    { label: "High", value: 28, color: C.high },
    { label: "Medium", value: 18, color: C.medium },
    { label: "Low", value: 12, color: C.ai },
    { label: "Resolved", value: 18, color: C.resolved },
  ];

  return (
    <div className="stagger-grid" style={{ display: "grid", gap: 18 }}>
      <Card style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.10), rgba(14,165,233,0.06), rgba(124,58,237,0.08), rgba(255,255,255,0.96))" }}>
        <CardContent style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ color: C.text2, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Financial intelligence / AI-powered threat detection</div>
              <h1 style={{ margin: "8px 0 0", fontSize: 32, lineHeight: 1.1, letterSpacing: "-0.04em", color: C.text }}>AML Intelligence</h1>
              <p style={{ margin: "8px 0 0", color: C.text2, fontSize: 14, maxWidth: 760 }}>AI-powered transaction monitoring and financial crime detection for compliance teams, investigators, and enterprise risk operations.</p>
            </div>
            <div style={{ display: "grid", gap: 10, justifyItems: "end" }}>
              <Tabs items={QUICK_FILTERS} value={selectedPeriod} onChange={setSelectedPeriod} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "end" }}>
                <Badge col={C.brand}>High Trust</Badge>
                <Badge col={C.violet}>Adaptive UI</Badge>
                <Badge col={C.critical}>4 Critical</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <StatGrid stats={kpis} />

      <div className="overview-split" style={{ display: "grid", gap: 18 }}>
        <DonutScore score={38} label="High Risk" detail="Current model output across monitored windows and confirmed violations." />
        <AnalyticsChart title="Transaction Risk Overview" subtitle="Switch between Transaction Volume, Risk Score, Violations, Confirmed Threats and SAR Cases." values={overviewSeries} tabValue={selectedRiskMetric} setTabValue={setSelectedRiskMetric} rangeValue={selectedPeriod} setRangeValue={setSelectedPeriod} color={C.brand} />
      </div>

      <DistributionCard values={riskDistribution} />

      <div className="overview-duo" style={{ display: "grid", gap: 18 }}>
        <ThreatTable data={baseThreats} onOpenThreat={openThreat} page={threatPage} setPage={setThreatPage} rowsPerPage={4} />
        <Card>
          <CardHeader>
            <CardTitle>AI Insight</CardTitle>
            <CardDescription>Explainable AI output tailored for compliance analysts.</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 14 }}>
            <div className="soft-card-elevated" style={{ padding: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>Suspicious layering pattern detected across 4 intermediary accounts.</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginTop: 16 }}>
                <div><div style={{ color: C.text2, fontSize: 12 }}>Risk probability</div><div style={{ color: C.critical, fontSize: 26, fontWeight: 800, letterSpacing: "-0.04em" }}>94%</div></div>
                <div><div style={{ color: C.text2, fontSize: 12 }}>Estimated exposure</div><div style={{ color: C.text, fontSize: 26, fontWeight: 800, letterSpacing: "-0.04em" }}>{moneyFmt.format(75000)}</div></div>
              </div>
            </div>
            {["Transaction layering", "High velocity", "Unusual routing", "Structuring behavior"].map((item) => <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, color: C.text }}><span style={{ width: 8, height: 8, borderRadius: 999, background: C.brand }} />{item}</div>)}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button tone="teal">Investigate</Button>
              <Button variant="outline" tone="blue">Create Case</Button>
              <Button variant="outline" tone="slate">Generate Report</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <NetworkGraph onExplain={() => openThreat(baseThreats[3])} />
    </div>
  );
}

function ThreatsPage({ search, threatPage, setThreatPage, openThreat }) {
  const [severity, setSeverity] = useState("All");
  const [status, setStatus] = useState("All");
  const [sortKey, setSortKey] = useState("riskScore");

  const filtered = useMemo(() => baseThreats.filter((item) => {
    const q = search.toLowerCase();
    const matches = [item.id, item.rule, item.txn, item.from, item.to, item.evidence, item.route, item.category].join(" ").toLowerCase().includes(q);
    const sev = severity === "All" || item.severity === severity.toLowerCase();
    const stat = status === "All" || item.statusLabel === status;
    return matches && sev && stat;
  }).sort((a, b) => (sortKey === "amount" ? b.amount - a.amount : b.riskScore - a.riskScore)), [search, severity, status, sortKey]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <SectionHeading
        eyebrow="Threat intelligence"
        title="Threats"
        description="Modern analyst workflow for reviewing active threats with filtering, sorting, pagination and one-click investigation opening."
        actions={[
          <Select key="s1" value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ width: 150 }}><option>All</option><option>critical</option><option>high</option><option>medium</option></Select>,
          <Select key="s2" value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 150 }}><option>All</option><option>Open</option><option>Investigating</option><option>Resolved</option></Select>,
          <Select key="s3" value={sortKey} onChange={(e) => setSortKey(e.target.value)} style={{ width: 150 }}><option value="riskScore">Sort: Risk</option><option value="amount">Sort: Amount</option></Select>,
        ]}
      />
      <ThreatTable data={filtered} onOpenThreat={openThreat} page={threatPage} setPage={setThreatPage} title="Active Threats" viewAllLabel="View all threats" rowsPerPage={6} />
    </div>
  );
}

function ThreatDetailPage({ threat }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <SectionHeading
        eyebrow="Threat detail"
        title={`${threat?.id || "V-001"} · Investigation workspace`}
        description="Detailed threat investigation with risk summary, AI explanation, related accounts, evidence and case actions."
        actions={[
          <Button key="b1" tone="teal">Assign</Button>,
          <Button key="b2" variant="outline" tone="blue">Escalate</Button>,
          <Button key="b3" variant="outline" tone="slate">Mark resolved</Button>,
        ]}
      />
      <div className="detail-split" style={{ display: "grid", gap: 16 }}>
        <Card>
          <CardHeader>
            <CardTitle>Threat summary</CardTitle>
            <CardDescription>Risk score, transaction details, and rule explanation.</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge col={SEVER[threat?.severity || "critical"].col}>{threat?.severity || "critical"}</Badge>
              <Badge col={C.ai}>{threat?.rule || "R-001"}</Badge>
              <Badge col={C.resolved}>{threat?.statusLabel || "Open"}</Badge>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              <div><div style={{ color: C.text2, fontSize: 12 }}>Transaction</div><div className="text-mono" style={{ color: C.text, fontWeight: 700 }}>{threat?.txn || "TXN-99825"}</div></div>
              <div><div style={{ color: C.text2, fontSize: 12 }}>Amount</div><div className="text-mono" style={{ color: C.text, fontWeight: 700 }}>{moneyFmt.format(threat?.amount || 12500)}</div></div>
              <div><div style={{ color: C.text2, fontSize: 12 }}>Risk score</div><div style={{ color: C.critical, fontWeight: 800, fontSize: 24 }}>{threat?.riskScore || 94}</div></div>
            </div>
            <Separator />
            <div>
              <div style={{ color: C.text2, fontSize: 12, marginBottom: 6 }}>Rule triggered</div>
              <div style={{ color: C.text, fontSize: 14, lineHeight: 1.65 }}>{threat?.ruleText || "Single transaction exceeding $10,000 — mandatory CTR filing required per BSA §5313."}</div>
            </div>
            <div>
              <div style={{ color: C.text2, fontSize: 12, marginBottom: 6 }}>AI explanation</div>
              <div style={{ color: C.text, fontSize: 14, lineHeight: 1.65 }}>{threat?.evidence || "Transaction exceeds historical account behavior and shows a layered route through intermediary accounts."}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Case actions</CardTitle>
            <CardDescription>Analyst workflow controls and evidence capture.</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 12 }}>
            {["Create case", "Generate SAR", "Export report", "Add analyst note"].map((label) => <Button key={label} variant="outline" tone="slate" block>{label}</Button>)}
            <Separator />
            <div style={{ color: C.text2, fontSize: 12 }}>Evidence</div>
            <div className="soft-card" style={{ padding: 14, color: C.text, lineHeight: 1.6 }}>{threat?.remediation || "Evidence packet includes transaction chain, account history, and AI-generated rationale."}</div>
          </CardContent>
        </Card>
      </div>
      <NetworkGraph onExplain={() => {}} selectedNode={threat?.from || "ACC-2200"} />
    </div>
  );
}

function TransactionsPage({ search, openThreat }) {
  const rows = baseThreats.filter((item) => [item.txn, item.from, item.to, item.rule, item.statusLabel, item.category].join(" ").toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <SectionHeading eyebrow="Transactions" title="Transaction Explorer" description="Search by transaction ID, account, amount, country, risk score, date, rule and status using a modern table interface." />
      <Card>
        <CardContent style={{ padding: 18, display: "grid", gap: 12 }}>
          <div className="filter-grid" style={{ display: "grid", gap: 10 }}>
            <Input placeholder="Transaction ID" />
            <Input placeholder="Account" />
            <Input placeholder="Amount" />
            <Select><option>Country</option><option>US</option><option>UK</option><option>CA</option></Select>
            <Select><option>Status</option><option>Open</option><option>Investigating</option><option>Resolved</option></Select>
          </div>
          <ThreatTable data={rows} onOpenThreat={openThreat} rowsPerPage={8} title="Transaction table" viewAllLabel="Advanced filters" />
        </CardContent>
      </Card>
    </div>
  );
}

function NetworkPage() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <SectionHeading eyebrow="Network analytics" title="Transaction Network" description="Interactive graph, account details, suspicious path highlighting and explainable AI controls." />
      <NetworkGraph onExplain={() => {}} />
      <div className="soft-card" style={{ padding: 18 }}>
      <div className="analysis-pairs" style={{ display: "grid", gap: 12 }}>
        {HIGH_RISK_PAIRS.map((row, idx) => (
          <div key={idx} style={{ padding: 14, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12 }}>
            <div className="text-mono" style={{ color: C.text, fontWeight: 700 }}>{row[0]} → {row[1]}</div>
            <div style={{ color: C.text2, fontSize: 12, marginTop: 6 }}>{row[2]} · {row[3]}</div>
            <Badge col={row[6] === "CRITICAL" ? C.critical : C.high} sm>{row[6]}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PoliciesPage() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <SectionHeading eyebrow="Compliance" title="Policy Management" description="Create, edit, disable, test and review AML rule histories from a clean policy operations workspace." actions={[<Button key="create" tone="teal">Create rule</Button>, <Button key="test" variant="outline" tone="slate">Test rule</Button>]} />
      {AML_RULES.map((group) => (
        <Card key={group.cat}>
          <CardHeader>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <CardTitle>{group.cat}</CardTitle>
                <CardDescription>{group.basis}</CardDescription>
              </div>
              <Badge col={group.col}>Active set</Badge>
            </div>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 10 }}>
            {group.rules.map((rule) => (
              <div key={rule.id} className="table-row policy-row" style={{ display: "grid", gap: 12, padding: 14, border: `1px solid ${C.border}`, borderRadius: 12, alignItems: "center" }}>
                <div className="text-mono" style={{ color: C.text, fontWeight: 700 }}>{rule.id}</div>
                <div>
                  <div style={{ color: C.text, fontWeight: 600 }}>{rule.desc}</div>
                  <div style={{ color: C.text2, fontSize: 12, marginTop: 4 }}>Triggered count · 128 · Last triggered 2m ago</div>
                </div>
                <Badge col={SEVER[rule.sev].col}>{rule.sev}</Badge>
                <div className="policy-actions" style={{ display: "flex", gap: 8, justifyContent: "end", flexWrap: "wrap" }}>
                  <Button variant="outline" tone="slate">Edit</Button>
                  <Button variant="outline" tone="slate">History</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CasesPage() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <SectionHeading eyebrow="Compliance workflow" title="Case Management" description="Track cases through New, Investigating, Escalated, Awaiting Review, Resolved and False Positive states." />
      <div className="case-split" style={{ display: "grid", gap: 16 }}>
        <Card>
          <CardHeader><CardTitle>Cases</CardTitle><CardDescription>Each case contains threats, transactions, accounts and AI summary.</CardDescription></CardHeader>
          <CardContent style={{ display: "grid", gap: 12 }}>
            {caseSeed.map((item) => (
              <div key={item.id} style={{ padding: 14, border: `1px solid ${C.border}`, borderRadius: 12, background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
                  <div>
                    <div className="text-mono" style={{ color: C.text, fontWeight: 700 }}>{item.id}</div>
                    <div style={{ color: C.text2, fontSize: 12, marginTop: 4 }}>{item.threats.join(", ")} · {item.analyst}</div>
                  </div>
                  <Badge col={item.status === "Resolved" ? C.resolved : item.status === "Escalated" ? C.medium : item.status === "Awaiting Review" ? C.ai : C.brand}>{item.status}</Badge>
                </div>
                <div style={{ marginTop: 10, color: C.text2, fontSize: 12 }}>{item.notes}</div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Case detail</CardTitle><CardDescription>AI summary, timeline, evidence and analyst notes.</CardDescription></CardHeader>
          <CardContent style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
              <div><div style={{ color: C.text2, fontSize: 12 }}>Assigned analyst</div><div style={{ color: C.text, fontWeight: 700 }}>Meredith Lane</div></div>
              <div><div style={{ color: C.text2, fontSize: 12 }}>Case status</div><div style={{ color: C.brand, fontWeight: 700 }}>Investigating</div></div>
              <div><div style={{ color: C.text2, fontSize: 12 }}>Risk score</div><div style={{ color: C.critical, fontWeight: 800 }}>94</div></div>
            </div>
            <Separator />
            <div style={{ display: "grid", gap: 10 }}>
              {CASE_STATUSES.map((status) => <div key={status} style={{ display: "flex", justifyContent: "space-between", color: C.text }}><span>{status}</span><span style={{ color: C.text2 }}>—</span></div>)}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button tone="teal">Generate SAR</Button>
              <Button variant="outline" tone="slate">Create case note</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ReportsPage() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <SectionHeading eyebrow="Compliance workspace" title="Reports" description="Generate, preview, export and schedule AML, threat and SAR reports in a modern reporting flow." actions={[<Button key="gen" tone="teal">Generate</Button>, <Button key="export" variant="outline" tone="slate">Export</Button>, <Button key="schedule" variant="outline" tone="slate">Schedule</Button>]} />
      <div className="report-grid" style={{ display: "grid", gap: 14 }}>
        {REPORT_TYPES.map((report) => (
          <Card key={report}>
            <CardHeader>
              <CardTitle>{report}</CardTitle>
              <CardDescription>Preview, share and schedule enterprise reporting output.</CardDescription>
            </CardHeader>
            <CardContent style={{ display: "grid", gap: 10 }}>
              <Badge col={C.brand}>Ready</Badge>
              <div style={{ color: C.text2, fontSize: 12 }}>Includes compliance summary, evidence references and analyst notes.</div>
              <div style={{ display: "flex", gap: 8 }}><Button variant="outline" tone="slate">Preview</Button><Button tone="teal">Generate</Button></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SentinelPage() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <SectionHeading eyebrow="Operational monitoring" title="Sentinel" description="Continuous monitoring for model health, ingestion latency, processing backlog and alert generation." />
      <div className="sentinel-grid" style={{ display: "grid", gap: 14 }}>
        {[["System health", "99.8%", C.resolved], ["Model status", "Healthy", C.brand], ["Pipeline status", "Stable", C.ai], ["Latency", "128ms", C.high]].map(([label, value, color]) => (
          <Card key={label}><CardContent style={{ padding: 18 }}><div style={{ color: C.text2, fontSize: 12, fontWeight: 700 }}>{label}</div><div style={{ color, fontSize: 26, fontWeight: 800, marginTop: 8 }}>{value}</div></CardContent></Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Detection engine status</CardTitle><CardDescription>Transaction ingestion, alerts generated, processing latency and last model update.</CardDescription></CardHeader>
        <CardContent style={{ display: "grid", gap: 12 }}>
          {[["Transaction ingestion", 95, C.brand], ["Alerts generated", 72, C.high], ["Processing latency", 44, C.ai], ["Last model update", 88, C.resolved]].map(([label, value, color]) => (
            <div key={label} style={{ display: "grid", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: C.text, fontSize: 13 }}><span>{label}</span><span>{value}%</span></div>
              <Progress value={Number(value)} color={String(color)} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function InvestigationPage() {
  const [question, setQuestion] = useState("Why was this transaction flagged?");
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <SectionHeading eyebrow="AI investigation" title="AI Investigation" description="Ask the model why a transaction was flagged and receive explainable reasons, evidence and recommendations." actions={[<Button key="ask" tone="teal">Ask AI</Button>]} />
      <div className="detail-split" style={{ display: "grid", gap: 16 }}>
        <Card>
          <CardHeader><CardTitle>Ask the assistant</CardTitle><CardDescription>Example prompt: Why was this transaction flagged?</CardDescription></CardHeader>
          <CardContent style={{ display: "grid", gap: 12 }}>
            <Input value={question} onChange={(e) => setQuestion(e.target.value)} />
            <Button tone="teal">Ask AI</Button>
            <div className="soft-card-elevated" style={{ padding: 16, lineHeight: 1.7 }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: C.text }}>WHY FLAGGED?</div>
              <ol style={{ margin: 0, paddingLeft: 18, color: C.text }}>
                <li>Transaction exceeds historical account behavior.</li>
                <li>Transaction velocity is above normal threshold.</li>
                <li>Funds moved through multiple intermediary accounts.</li>
                <li>Destination account has elevated risk.</li>
              </ol>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>AI response summary</CardTitle><CardDescription>Risk score, confidence, reasons, evidence and related activity.</CardDescription></CardHeader>
          <CardContent style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              <div><div style={{ color: C.text2, fontSize: 12 }}>Risk score</div><div style={{ fontSize: 28, fontWeight: 800, color: C.critical }}>94</div></div>
              <div><div style={{ color: C.text2, fontSize: 12 }}>Confidence</div><div style={{ fontSize: 28, fontWeight: 800, color: C.brand }}>97%</div></div>
            </div>
            <Separator />
            <div style={{ display: "grid", gap: 8 }}>
              {["Related transactions", "Related accounts", "Historical behavior", "Recommended action"].map((item) => <div key={item} style={{ display: "flex", justifyContent: "space-between", color: C.text }}><span>{item}</span><span style={{ color: C.text2 }}>View</span></div>)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ScannerPage() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <SectionHeading eyebrow="AI tools" title="AI Scanner" description="Preserve the simulated scan workflow with a modern control surface and readable output." />
      <Card>
        <CardContent style={{ padding: 18, display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 700, color: C.text }}>aml_db · localhost:3306</div>
              <div style={{ color: C.text2, fontSize: 13, marginTop: 4 }}>487,312 rows · 25 rules · IBM AML dataset</div>
            </div>
            <Button tone="teal">Run AML scan</Button>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {DB_TABLES.map((table) => (
              <div key={table.nm} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14, border: `1px solid ${C.border}`, borderRadius: 12, background: "#fff" }}>
                <div>
                  <div style={{ fontWeight: 700, color: C.text }}>{table.nm}</div>
                  <div style={{ color: C.text2, fontSize: 12 }}>{table.fields}</div>
                </div>
                <Badge col={table.risk === "critical" ? C.critical : table.risk === "high" ? C.high : C.medium}>{table.v} violations</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AuditPage({ profile, onEditProfile }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <SectionHeading eyebrow="System" title="Audit Log & Settings" description="Track activity and expose system configuration in a calm, enterprise-focused workspace." />
      <div className="detail-split" style={{ display: "grid", gap: 16 }}>
        <Card>
          <CardHeader><CardTitle>Audit trail</CardTitle><CardDescription>Recent actions across analysts, AI assistants and automation.</CardDescription></CardHeader>
          <CardContent style={{ display: "grid", gap: 10 }}>
            {auditLog.map((entry) => (
              <div key={entry.time} style={{ padding: 14, border: `1px solid ${C.border}`, borderRadius: 12, background: "#fff", display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ color: C.text, fontWeight: 700 }}>{entry.action}</div>
                  <div style={{ color: C.text2, fontSize: 12, marginTop: 4 }}>{entry.actor}</div>
                </div>
                <Badge col={C.ai}>{entry.time}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start", flexWrap: "wrap" }}>
              <div>
                <CardTitle>Profile & access</CardTitle>
                <CardDescription>Editable user details, role permissions, and workspace preferences.</CardDescription>
              </div>
              <Button tone="violet" onClick={onEditProfile}>Edit profile</Button>
            </div>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 14 }}>
            <div className="soft-card-elevated" style={{ padding: 16, display: "grid", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ color: C.text, fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>{profile.name}</div>
                  <div style={{ color: C.text2, fontSize: 13, marginTop: 4 }}>{profile.title}</div>
                </div>
                <Avatar name={profile.name} />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  { label: "Email", value: profile.email },
                  { label: "Team", value: profile.team },
                  { label: "Location", value: profile.location },
                  { label: "Timezone", value: profile.timezone },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", gap: 12, color: C.text, fontSize: 13 }}>
                    <span style={{ color: C.text2 }}>{item.label}</span>
                    <span style={{ fontWeight: 700, textAlign: "right" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {[
                { label: "Profile editing", on: profile.permissions.editUserInfo, tone: C.resolved },
                { label: "Report export", on: profile.permissions.exportReports, tone: C.sky },
                { label: "Policy management", on: profile.permissions.managePolicies, tone: C.violet },
                { label: "Case assignment", on: profile.permissions.assignCases, tone: C.brand },
              ].map((item) => (
                <div key={item.label} className="permission-card" data-on={item.on}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <span style={{ color: C.text, fontSize: 14, fontWeight: 700 }}>{item.label}</span>
                    <Badge col={item.on ? item.tone : C.muted} sm>{item.on ? "Enabled" : "Restricted"}</Badge>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {["Environment: Production", "Notifications: On", "Model refresh: Hourly", "Export policy: Restricted"].map((item) => <div key={item} style={{ display: "flex", justifyContent: "space-between", color: C.text }}><span>{item}</span><span style={{ color: C.brand }}>Manage</span></div>)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MobileNav({ page, setPage }) {
  const items = [
    { id: "overview", label: "Overview", short: "OV" },
    { id: "threats", label: "Threats", short: "TH" },
    { id: "transactions", label: "Txns", short: "TX" },
    { id: "network", label: "Network", short: "NW" },
    { id: "sentinel", label: "Sentinel", short: "SN" },
  ];
  return (
    <div className="mobile-nav" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50, background: "rgba(255,255,255,0.96)", borderTop: `1px solid ${C.border}`, backdropFilter: "blur(16px)", boxShadow: "0 -10px 24px rgba(15, 23, 42, 0.06)", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", padding: 8 }}>
      {items.map((item) => (
        <button key={item.id} type="button" aria-current={page === item.id ? "page" : undefined} onClick={() => setPage(item.id)} style={{ border: "none", background: page === item.id ? "rgba(37,99,235,0.10)" : "transparent", color: page === item.id ? C.brand : C.text2, borderRadius: 12, padding: "8px 4px", display: "grid", justifyItems: "center", gap: 4, fontSize: 11, fontWeight: 700 }}>
          <span style={{ width: 26, height: 26, borderRadius: 999, display: "grid", placeItems: "center", background: page === item.id ? C.brand : C.panelAlt, color: page === item.id ? "#fff" : C.text2, boxShadow: page === item.id ? "0 8px 18px rgba(37,99,235,0.18)" : "none", fontSize: 11, fontWeight: 800, letterSpacing: "0.02em" }}>{item.short}</span>
          <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("overview");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("Last 24 hours");
  const [toast, setToast] = useState(null);
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [profileDraft, setProfileDraft] = useState(INITIAL_PROFILE);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedThreat, setSelectedThreat] = useState(baseThreats[3]);
  const [selectedPeriod, setSelectedPeriod] = useState("Today");
  const [selectedRiskMetric, setSelectedRiskMetric] = useState("Risk Score");
  const [threatPage, setThreatPage] = useState(1);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [clock, setClock] = useState(new Date());
  const [pageBusy, setPageBusy] = useState(true);
  const pageBusyTimerRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    pageBusyTimerRef.current = window.setTimeout(() => setPageBusy(false), 220);
    return () => {
      if (pageBusyTimerRef.current) {
        window.clearTimeout(pageBusyTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => () => {
    if (pageBusyTimerRef.current) {
      window.clearTimeout(pageBusyTimerRef.current);
    }
  }, []);

  const navigatePage = useCallback((nextPage) => {
    setPageBusy(true);
    if (pageBusyTimerRef.current) {
      window.clearTimeout(pageBusyTimerRef.current);
    }
    setPage(nextPage);
    pageBusyTimerRef.current = window.setTimeout(() => setPageBusy(false), 220);
  }, []);

  const openThreat = useCallback((threat) => {
    setSelectedThreat(threat);
    navigatePage("investigation");
    setToast({ msg: `${threat.id} opened in investigation workspace`, col: C.brand });
  }, [navigatePage]);

  const openProfileEditor = useCallback(() => {
    setProfileDraft(profile);
    setProfileOpen(true);
  }, [profile]);

  const saveProfile = useCallback(() => {
    setProfile(profileDraft);
    setProfileOpen(false);
    setToast({ msg: "User profile updated", col: C.violet });
  }, [profileDraft]);

  const content = useMemo(() => {
    switch (page) {
      case "overview": return <OverviewPage openThreat={openThreat} threatPage={threatPage} setThreatPage={setThreatPage} selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} selectedRiskMetric={selectedRiskMetric} setSelectedRiskMetric={setSelectedRiskMetric} />;
      case "threats": return <ThreatsPage search={search} threatPage={threatPage} setThreatPage={setThreatPage} openThreat={openThreat} />;
      case "transactions": return <TransactionsPage search={search} openThreat={openThreat} />;
      case "network": return <NetworkPage />;
      case "policies": return <PoliciesPage />;
      case "cases": return <CasesPage />;
      case "reports": return <ReportsPage />;
      case "scanner": return <ScannerPage />;
      case "sentinel": return <SentinelPage />;
      case "investigation": return <ThreatDetailPage threat={selectedThreat} />;
      case "audit": return <AuditPage profile={profile} onEditProfile={openProfileEditor} />;
      case "settings": return <AuditPage profile={profile} onEditProfile={openProfileEditor} />;
      default: return <OverviewPage openThreat={openThreat} threatPage={threatPage} setThreatPage={setThreatPage} selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} selectedRiskMetric={selectedRiskMetric} setSelectedRiskMetric={setSelectedRiskMetric} />;
    }
  }, [page, search, selectedThreat, threatPage, selectedPeriod, selectedRiskMetric, openThreat, profile, openProfileEditor]);

  return (
    <div className="app-shell">
      <style>{GLOBAL_CSS}</style>
      <Toast toast={toast} />

      <div className="app-layout" style={{ display: "grid", minHeight: "100vh" }}>
        <div className="desktop-sidebar" style={{ position: "sticky", top: 0, height: "100vh" }}>
          <Sidebar page={page} setPage={navigatePage} />
        </div>

        <div style={{ minWidth: 0, paddingBottom: 96 }}>
          <Header
            search={search}
            setSearch={setSearch}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            timeLabel={clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            onMenuClick={() => setMobileDrawerOpen(true)}
            profile={profile}
            onEditProfile={openProfileEditor}
          />
          <main className="page-frame" style={{ padding: 18, display: "grid", gap: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ color: C.text2, fontSize: 13 }}>Environment: Production · {dateFilter} · {clock.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</div>
              <Badge col={C.brand}>Compliance ready</Badge>
            </div>
            <div className={`page-stage ${pageBusy ? "is-busy" : ""}`} aria-busy={pageBusy}>
              {pageBusy && <div className="page-stage-loader" />}
              <div key={page} className="page-stage-body">
                {content}
              </div>
            </div>
          </main>
        </div>
      </div>

      <MobileDrawer open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)} page={page} setPage={navigatePage} />
      <MobileNav page={page} setPage={navigatePage} />
      <ProfileEditorModal
        open={profileOpen}
        profile={profile}
        draft={profileDraft}
        setDraft={setProfileDraft}
        onClose={() => setProfileOpen(false)}
        onSave={saveProfile}
      />
    </div>
  );
}
