// ─────────────────────────────────────────────────────────────────────────────
// PolicyGuard AI — AML Intelligence Dashboard (Main App)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { C, GLOBAL_CSS, SEVER, STATUS, riskColor, riskLabel, cn, formatNumber, formatCurrency, formatRelative, formatTime, formatDate } from "./theme/colors";
import { Toast, ToastContainer } from "./components/ui/Toast";
import { Button } from "./components/ui/Button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "./components/ui/Card";
import { Input } from "./components/ui/Input";
import { Select } from "./components/ui/Select";
import { Progress } from "./components/ui/Progress";
import { Tabs } from "./components/ui/Tabs";
import { Badge } from "./components/ui/Badge";
import { Avatar } from "./components/ui/Avatar";
import { Separator } from "./components/ui/Separator";

// Layout components
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";

// Views
import { OverviewView } from "./views/OverviewView";
import { ThreatsView } from "./views/ThreatsView";
import { TransactionsView } from "./views/TransactionsView";
import { NetworkView } from "./views/NetworkView";
import { PoliciesView } from "./views/PoliciesView";
import { CasesView } from "./views/CasesView";
import { ReportsView } from "./views/ReportsView";
import { ScannerView } from "./views/ScannerView";
import { SentinelView } from "./views/SentinelView";
import { InvestigationView } from "./views/InvestigationView";
import { AuditView } from "./views/AuditView";
import { SettingsView } from "./views/SettingsView";

// API service
import { api } from "./services/api";

// Auth context
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const NAV_GROUPS = [
  { label: "Platform", items: [{ id: "overview", label: "Overview", icon: "home" }] },
  { label: "Threat Intelligence", items: [
    { id: "threats", label: "Threats", icon: "alert-triangle" },
    { id: "transactions", label: "Transactions", icon: "credit-card" },
    { id: "network", label: "Network", icon: "git-branch" },
  ]},
  { label: "Compliance", items: [
    { id: "policies", label: "Policies", icon: "file-text" },
    { id: "cases", label: "SAR Cases", icon: "briefcase" },
    { id: "reports", label: "Reports", icon: "bar-chart-2" },
  ]},
  { label: "AI Tools", items: [
    { id: "scanner", label: "AI Scanner", icon: "search" },
    { id: "sentinel", label: "Sentinel", icon: "activity" },
    { id: "investigation", label: "AI Investigation", icon: "brain" },
  ]},
  { label: "System", items: [
    { id: "audit", label: "Audit Log", icon: "clipboard-list" },
    { id: "settings", label: "Settings", icon: "settings" },
  ]},
];

const QUICK_FILTERS = ["Today", "24 hours", "7 days", "30 days", "Custom"];

function BrandMark({ size = 34 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id="pg-brand" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={C.brand} />
          <stop offset="100%" stopColor={C.accent} />
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

function SectionHeading({ eyebrow, title, description, actions, children }) {
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

function StatCard({ label, value, trend, trendLabel, period, spark, tone = C.brand, trendColor }) {
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

function StatGrid({ stats }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
      {stats.map((s) => <StatCard key={s.label} {...s} />)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main App with Auth
// ─────────────────────────────────────────────────────────────────────────────

function AppContent() {
  const { user, login, logout, loading: authLoading } = useAuth();
  const [page, setPage] = useState("overview");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("Last 24 hours");
  const [toasts, setToasts] = useState([]);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("Today");
  const [selectedRiskMetric, setSelectedRiskMetric] = useState("Risk Score");
  const [threatPage, setThreatPage] = useState(1);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [clock, setClock] = useState(new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const addToast = useCallback((toast) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const openThreat = useCallback((threat) => {
    setSelectedThreat(threat);
    setPage("investigation");
    addToast({ message: `${threat.threat_id} opened in investigation`, type: "info" });
  }, [addToast]);

  const openCase = useCallback((caseItem) => {
    setPage("cases");
    addToast({ message: `Case ${caseItem.case_id} opened`, type: "info" });
  }, [addToast]);

  const runScan = useCallback(async () => {
    setGlobalLoading(true);
    addToast({ message: "AML scan started", type: "info" });
    try {
      await api.scans.start({ tables: ["transactions", "accounts", "beneficiaries"] });
      addToast({ message: "Scan completed successfully", type: "success" });
    } catch (e) {
      addToast({ message: "Scan failed", type: "error" });
    } finally {
      setGlobalLoading(false);
    }
  }, [addToast]);

  const content = useMemo(() => {
    switch (page) {
      case "overview": return <OverviewView openThreat={openThreat} threatPage={threatPage} setThreatPage={setThreatPage} selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} selectedRiskMetric={selectedRiskMetric} setSelectedRiskMetric={setSelectedRiskMetric} />;
      case "threats": return <ThreatsView search={search} threatPage={threatPage} setThreatPage={setThreatPage} openThreat={openThreat} />;
      case "transactions": return <TransactionsView search={search} openThreat={openThreat} />;
      case "network": return <NetworkView />;
      case "policies": return <PoliciesView />;
      case "cases": return <CasesView openCase={openCase} />;
      case "reports": return <ReportsView />;
      case "scanner": return <ScannerView onRunScan={runScan} />;
      case "sentinel": return <SentinelView />;
      case "investigation": return <InvestigationView threat={selectedThreat} onClose={() => { setSelectedThreat(null); setPage("threats"); }} />;
      case "audit": return <AuditView />;
      case "settings": return <SettingsView />;
      default: return <OverviewView openThreat={openThreat} threatPage={threatPage} setThreatPage={setThreatPage} selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} selectedRiskMetric={selectedRiskMetric} setSelectedRiskMetric={setSelectedRiskMetric} />;
    }
  }, [page, search, selectedThreat, threatPage, selectedPeriod, selectedRiskMetric, openThreat]);

  if (authLoading) {
    return (
      <div className="app-shell" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <style>{GLOBAL_CSS}</style>
        <div className="skeleton" style={{ width: 200, height: 200, borderRadius: "50%" }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-shell">
      <style>{GLOBAL_CSS}</style>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      <div className="app-layout" style={{ display: "grid", minHeight: "100vh" }}>
        <Sidebar
          page={page}
          setPage={setPage}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          navGroups={NAV_GROUPS}
        />
        
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Topbar
            search={search}
            setSearch={setSearch}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            timeLabel={formatTime(clock)}
            onMenuClick={() => setMobileDrawerOpen(true)}
            user={user}
            onLogout={logout}
            notifications={3}
          />
          
          <main className="page-frame" style={{ padding: 20, display: "grid", gap: 20, flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ color: C.textDim, fontSize: 13 }}>
                Environment: Production · {dateFilter} · {formatDate(clock)}
              </div>
              <Badge variant="soft" color={C.brand}>Compliance Ready</Badge>
            </div>
            {globalLoading && (
              <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.brand}, ${C.accent})`, zIndex: C.zSticky, animation: "shimmer 1.5s infinite" }} />
            )}
            {content}
          </main>
        </div>
      </div>
    </div>
  );
}

function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("meredith.lane@policyguard.ai");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
    } catch (e) {
      setError(e.message || "Invalid credentials");
    }
  };

  return (
    <div className="app-shell" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <style>{GLOBAL_CSS}</style>
      <Card className="card-elevated" style={{ width: "100%", maxWidth: 420 }}>
        <CardContent style={{ padding: 32, display: "grid", gap: 24 }}>
          <div style={{ textAlign: "center" }}>
            <BrandMark size={56} />
            <h1 style={{ margin: "16px 0 4px", fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: C.text }}>PolicyGuard AI</h1>
            <p style={{ color: C.textDim, fontSize: 14 }}>AML Intelligence Dashboard</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="meredith.lane@policyguard.ai"
                disabled={loading}
              />
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={loading}
              />
            </div>
            {error && <div className="badge badge-critical" style={{ justifyContent: "center", padding: "8px 12px" }}>{error}</div>}
            <Button type="submit" variant="primary" block size="lg" loading={loading}>
              Sign In
            </Button>
          </form>
          <div style={{ marginTop: 8, paddingTop: 16, borderTop: `1px solid ${C.border}`, color: C.textDim, fontSize: 12, textAlign: "center" }}>
            Demo: meredith.lane@policyguard.ai / password123
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}