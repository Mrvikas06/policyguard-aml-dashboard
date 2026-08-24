// ─────────────────────────────────────────────────────────────────────────────
// Reports View — Report generation and management
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { C, formatRelative } from "../theme/colors";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Select } from "../components/ui/Select";
import { SectionHeading } from "../components/shared";
import { api } from "../services/api";

const REPORT_TYPES = ["AML Summary", "Threat Report", "Transaction Report", "Compliance Report", "SAR Report", "AI Risk Report"];

export function ReportsView() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      try {
        const res = await api.reports.list({ limit: 12 });
        setReports(res.data || []);
      } catch (e) {
        console.error("Failed to load reports:", e);
        setReports([
          { report_id: "RPT-20241219-001", type: "AML Summary", title: "AML Summary - Dec 19, 2024", status: "generated", generated_by: "Meredith Lane", created_at: Date.now() - 3600000, completed_at: Date.now() - 1800000 },
          { report_id: "RPT-20241218-001", type: "Threat Report", title: "Threat Report - Dec 18, 2024", status: "generated", generated_by: "Sarah Chen", created_at: Date.now() - 86400000, completed_at: Date.now() - 85000000 },
          { report_id: "RPT-20241217-001", type: "Transaction Report", title: "Transaction Report - Dec 17, 2024", status: "generated", generated_by: "Marcus Patel", created_at: Date.now() - 172800000, completed_at: Date.now() - 171000000 },
          { report_id: "RPT-20241216-001", type: "Compliance Report", title: "Compliance Report - Dec 16, 2024", status: "generated", generated_by: "Alex Gomez", created_at: Date.now() - 259200000, completed_at: Date.now() - 258000000 },
          { report_id: "RPT-20241215-001", type: "SAR Report", title: "SAR Report - Dec 15, 2024", status: "draft", generated_by: "Lisa Khan", created_at: Date.now() - 345600000 },
          { report_id: "RPT-20241214-001", type: "AI Risk Report", title: "AI Risk Report - Dec 14, 2024", status: "generated", generated_by: "Meredith Lane", created_at: Date.now() - 432000000, completed_at: Date.now() - 431000000 },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const handleGenerate = async (type) => {
    setGenerating(type);
    try {
      await api.reports.create({ type, title: `${type} - ${new Date().toLocaleDateString()}`, filters: {} });
      setReports(prev => [{ report_id: `RPT-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`, type, title: `${type} - ${new Date().toLocaleDateString()}`, status: "generating", generated_by: "Current User", created_at: Date.now() }, ...prev]);
    } catch (e) {
      console.error("Generation failed:", e);
    } finally {
      setGenerating(null);
    }
  };

  const statusColors = { generated: C.resolved, generating: C.ai, draft: C.high, archived: C.textMuted };

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
      <SectionHeading eyebrow="Compliance workspace" title="Reports" description="Generate, preview, export and schedule AML, threat and SAR reports in a modern reporting flow." actions={[
        <Button key="gen" tone="accent" onClick={() => handleGenerate("AML Summary")} loading={generating === "AML Summary"}>Generate AML Summary</Button>,
        <Button key="export" variant="outline" tone="slate">Export All</Button>,
        <Button key="schedule" variant="outline" tone="slate">Schedule</Button>,
      ]} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        {reports.map((report) => (
          <Card key={report.report_id}>
            <CardHeader style={{ paddingBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
                <div>
                  <CardTitle style={{ fontSize: 15 }}>{report.title}</CardTitle>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                    <Badge variant="soft" color={C.brand} size="xs">{report.type}</Badge>
                    <Badge variant={report.status === "generated" ? "soft" : report.status === "generating" ? "soft" : "outline"} 
                      color={statusColors[report.status] || C.brand} size="xs" dot>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent style={{ display: "grid", gap: 12, paddingTop: 8 }}>
              <div style={{ color: C.textDim, fontSize: 12 }}>
                Generated by {report.generated_by} · {formatRelative(report.created_at)}
                {report.completed_at && <span style={{ marginLeft: 8 }}>· Completed {formatRelative(report.completed_at)}</span>}
              </div>
              <div style={{ color: C.textDim, fontSize: 12 }}>Includes compliance summary, evidence references and analyst notes.</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {report.status === "generated" ? (
                  <>
                    <Button variant="outline" size="sm" tone="slate">Preview</Button>
                    <Button variant="outline" size="sm" tone="slate">Download</Button>
                  </>
                ) : report.status === "generating" ? (
                  <Button variant="outline" size="sm" tone="slate" disabled>Generating...</Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" tone="slate">Preview</Button>
                    <Button size="sm" tone="accent" onClick={() => {}}>Generate</Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Report</CardTitle>
          <CardDescription>Configure and schedule a new compliance report</CardDescription>
        </CardHeader>
        <CardContent style={{ display: "grid", gap: 16, maxWidth: 600 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Report Type</label>
              <Select defaultValue={REPORT_TYPES[0]} style={{ width: "100%" }}>
                {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Schedule</label>
              <Select defaultValue="once" style={{ width: "100%" }}>
                <option value="once">One-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text }}>
              <input type="checkbox" style={{ width: 16, height: 16, accentColor: C.brand }} />
              Include evidence packages
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text }}>
              <input type="checkbox" style={{ width: 16, height: 16, accentColor: C.brand }} />
              Include analyst notes
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text }}>
              <input type="checkbox" style={{ width: 16, height: 16, accentColor: C.brand }} />
              Auto-email to stakeholders
            </label>
          </div>
          <Button tone="accent" onClick={() => {}}>Generate Report</Button>
        </CardContent>
      </Card>
    </div>
  );
}