// ─────────────────────────────────────────────────────────────────────────────
// Scanner View — AI AML batch scanner
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { C, formatNumber } from "../theme/colors";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import { SectionHeading } from "../components/shared";
import { api } from "../services/api";

export function ScannerView({ onRunScan }) {
  const [scanJobs, setScanJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningJob, setRunningJob] = useState(null);

  useEffect(() => {
    async function fetchScans() {
      setLoading(true);
      try {
        const res = await api.scans.list({ limit: 10 });
        setScanJobs(res.data || []);
        const running = res.data?.find(j => j.status === "running");
        if (running) setRunningJob(running);
      } catch (e) {
        console.error("Failed to load scans:", e);
        setScanJobs([
          { job_id: "SCAN-20241219-001", status: "completed", progress: 100, started_at: Date.now() - 3600000, completed_at: Date.now() - 1800000, tables_scanned: JSON.stringify(["transactions", "accounts", "beneficiaries"]), violations_found: 12 },
          { job_id: "SCAN-20241218-001", status: "completed", progress: 100, started_at: Date.now() - 86400000, completed_at: Date.now() - 85000000, tables_scanned: JSON.stringify(["transactions", "accounts"]), violations_found: 8 },
          { job_id: "SCAN-20241217-001", status: "completed", progress: 100, started_at: Date.now() - 172800000, completed_at: Date.now() - 171000000, tables_scanned: JSON.stringify(["transactions", "accounts", "watchlists"]), violations_found: 23 },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchScans();
  }, []);

  const handleRunScan = async () => {
    try {
      const res = await api.scans.start({ tables: ["transactions", "accounts", "beneficiaries", "customers", "watchlists"] });
      setRunningJob(res);
      setScanJobs(prev => [res, ...prev]);
      onRunScan?.();
    } catch (e) {
      console.error("Scan failed:", e);
    }
  };

  const DB_TABLES = [
    { nm: "transactions", rows: "487,312", v: 10, risk: "critical", fields: "Timestamp · From Account · To Account · Amount · Payment Format · is_laundering" },
    { nm: "accounts", rows: "12,481", v: 3, risk: "high", fields: "Account ID · Type · Open Date · Balance · Country" },
    { nm: "beneficiaries", rows: "8,220", v: 2, risk: "medium", fields: "Beneficiary ID · Name · Bank · Country · Risk Score" },
    { nm: "customers", rows: "45,621", v: 1, risk: "low", fields: "Customer ID · Name · KYC Status · Risk Rating · Onboarding Date" },
    { nm: "watchlists", rows: "1,247", v: 0, risk: "resolved", fields: "Entity ID · List Source · Match Type · Last Updated" },
  ];

  if (loading) {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <Card><CardContent className="skeleton" style={{ height: 80 }} /></Card>
        <Card className="skeleton" style={{ height: 400 }} />
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <SectionHeading eyebrow="AI tools" title="AI Scanner" description="Preserve the simulated scan workflow with a modern control surface and readable output." actions={[
        <Button key="run" tone="accent" onClick={handleRunScan} loading={!!runningJob} disabled={!!runningJob}>
          {runningJob ? "Scanning..." : "Run AML Scan"}
        </Button>,
      ]} />

      <Card>
        <CardContent style={{ padding: 20, display: "grid", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, color: C.text }}>aml_db · localhost:3306</div>
              <div style={{ color: C.textDim, fontSize: 13, marginTop: 4 }}>{formatNumber(487312)} rows · {DB_TABLES.length} tables · IBM AML dataset</div>
            </div>
          </div>

          {runningJob && (
            <div className="card card-elevated" style={{ borderColor: C.brand, padding: 16, display: "grid", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, color: C.text }}>{runningJob.job_id}</div>
                  <div style={{ color: C.textDim, fontSize: 13 }}>Scan in progress...</div>
                </div>
                <Badge variant="soft" color={C.ai}>Running</Badge>
              </div>
              <Progress value={runningJob.progress} color={C.brand} height={10} showLabel label={`${runningJob.progress}% complete`} />
              <div style={{ display: "flex", justifyContent: "space-between", color: C.textDim, fontSize: 12 }}>
                <span>Tables: {JSON.parse(runningJob.tables_scanned || '[]').join(", ")}</span>
                <span>Violations found: {runningJob.violations_found || 0}</span>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gap: 8 }}>
            {DB_TABLES.map((table) => (
              <div key={table.nm} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14, border: `1px solid ${C.border}`, borderRadius: C.radius, background: C.surface }}>
                <div>
                  <div style={{ fontWeight: 600, color: C.text, textTransform: "capitalize" }}>{table.nm}</div>
                  <div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>{table.fields}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Badge severity={table.risk} size="sm">{table.v} violations</Badge>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.textDim }}>{table.rows}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scan History</CardTitle>
          <CardDescription>Previous AML scan executions and results</CardDescription>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          <table className="data-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Started</th>
                <th>Completed</th>
                <th>Tables</th>
                <th>Violations</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {scanJobs.map((job, i) => (
                <tr key={i} className="table-row">
                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{job.job_id}</td>
                  <td>
                    <Badge 
                      variant="soft" 
                      color={job.status === "completed" ? C.resolved : job.status === "running" ? C.ai : job.status === "failed" ? C.critical : C.high} 
                      size="sm"
                    >
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Progress value={job.progress} color={job.status === "running" ? C.ai : C.brand} height={6} style={{ width: 80 }} />
                      <span style={{ fontSize: 12 }}>{job.progress}%</span>
                    </div>
                  </td>
                  <td style={{ color: C.textDim }}>{new Date(job.started_at).toLocaleString()}</td>
                  <td style={{ color: C.textDim }}>{job.completed_at ? new Date(job.completed_at).toLocaleString() : "—"}</td>
                  <td style={{ fontSize: 12, color: C.textDim }}>
                    {JSON.parse(job.tables_scanned || '[]').slice(0, 3).join(", ")}
                    {JSON.parse(job.tables_scanned || '[]').length > 3 && "..."}
                  </td>
                  <td style={{ fontWeight: 600, color: job.violations_found > 10 ? C.critical : job.violations_found > 5 ? C.high : C.medium }}>{job.violations_found}</td>
                  <td><Button variant="ghost" size="sm" tone="slate">Details</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}