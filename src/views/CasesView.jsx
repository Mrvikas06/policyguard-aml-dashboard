// ─────────────────────────────────────────────────────────────────────────────
// Cases View — SAR Case management
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { C, formatNumber, formatCurrency, formatRelative, cn } from "../theme/colors";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { SectionHeading } from "../components/shared";
import { api } from "../services/api";

export function CasesView({ openCase }) {
  const [cases, setCases] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedCase, setSelectedCase] = useState(null);

  const CASE_STATUSES = ["All", "New", "Investigating", "Escalated", "Awaiting Review", "Resolved", "False Positive"];
  const statusColors = {
    new: C.brand,
    investigating: C.ai,
    escalated: C.medium,
    awaiting_review: C.high,
    resolved: C.resolved,
    false_positive: C.textMuted,
  };

  useEffect(() => {
    async function fetchCases() {
      setLoading(true);
      try {
        const res = await api.cases.list({ page, limit: 10, status: statusFilter !== "All" ? statusFilter.toLowerCase().replace(" ", "_") : undefined });
        setCases(res.data || []);
        setTotal(res.pagination?.total || 0);
      } catch (e) {
        console.error("Failed to load cases:", e);
        setCases(Array.from({ length: 8 }, (_, i) => ({
          id: i,
          case_id: `CASE-${String(1040 + i).padStart(4, "0")}`,
          threat_ids: `V-${String((i * 2) + 1).padStart(4, "0")},V-${String((i * 2) + 2).padStart(4, "0")}`,
          status: ["new", "investigating", "escalated", "awaiting_review", "resolved", "false_positive"][i % 6],
          analyst_id: "1",
          risk_score: Math.floor(Math.random() * 40) + 60,
          notes: `Case ${1040 + i}: ${2} threat(s) linked. Under active investigation.`,
          analyst_name: ["Meredith Lane", "Sarah Chen", "Marcus Patel", "Alex Gomez"][i % 4],
          created_at: Date.now() - i * 86400000,
        })));
        setTotal(25);
      } finally {
        setLoading(false);
      }
    }
    fetchCases();
  }, [page, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(total / 10));

  const statusLabels = {
    new: "New",
    investigating: "Investigating",
    escalated: "Escalated",
    awaiting_review: "Awaiting Review",
    resolved: "Resolved",
    false_positive: "False Positive",
  };

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
      <SectionHeading eyebrow="Compliance workflow" title="Case Management" description="Track cases through New, Investigating, Escalated, Awaiting Review, Resolved and False Positive states." actions={[
        <Select key="status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 180 }}>
          {CASE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>,
        <Button key="create" tone="accent">Create Case</Button>,
      ]} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <CardHeader>
            <CardTitle>Cases</CardTitle>
            <CardDescription>Each case contains threats, transactions, accounts and AI summary</CardDescription>
          </CardHeader>
          <CardContent style={{ padding: 0 }}>
            <table className="data-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ width: 140 }}>Case ID</th>
                  <th>Threats</th>
                  <th style={{ width: 140 }}>Status</th>
                  <th style={{ width: 80 }}>Risk</th>
                  <th>Analyst</th>
                  <th style={{ width: 100 }}>Created</th>
                  <th style={{ width: 80 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id} className="table-row clickable" onClick={() => { setSelectedCase(c); openCase?.(c); }}>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: C.text }}>{c.case_id}</td>
                    <td style={{ color: C.textDim, fontSize: 12 }}>{c.threat_ids.split(",").map(t => `<span style="font-family:'JetBrains Mono',monospace">${t.trim()}</span>`).join(" ")}</td>
                    <td><Badge status={c.status} size="sm" /></td>
                    <td style={{ fontWeight: 600, color: c.risk_score >= 80 ? C.critical : c.risk_score >= 60 ? C.high : C.medium }}>{c.risk_score}</td>
                    <td style={{ color: C.textDim, fontSize: 13 }}>{c.analyst_name}</td>
                    <td style={{ color: C.textDim, fontSize: 12 }}>{formatRelative(c.created_at)}</td>
                    <td><Button variant="ghost" size="sm" tone="accent">Open</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderTop: `1px solid ${C.border}`, flexWrap: "wrap", gap: 12 }}>
              <div style={{ color: C.textDim, fontSize: 13 }}>Page {page} of {totalPages} · {total} cases</div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>Next</Button>
              </div>
            </div>          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{selectedCase ? `Case ${selectedCase.case_id}` : "Case Detail"}</CardTitle>
            <CardDescription>AI summary, timeline, evidence and analyst notes</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 16 }}>
            {selectedCase ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  <div className="card" style={{ padding: 16 }}>
                    <div style={{ color: C.textDim, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Assigned Analyst</div>
                    <div style={{ color: C.text, fontSize: 14, fontWeight: 700, marginTop: 4 }}>{selectedCase.analyst_name}</div>
                  </div>
                  <div className="card" style={{ padding: 16 }}>
                    <div style={{ color: C.textDim, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Case Status</div>
                    <div style={{ color: statusColors[selectedCase.status] || C.text, fontSize: 14, fontWeight: 700, marginTop: 4 }}>{statusLabels[selectedCase.status] || selectedCase.status}</div>
                  </div>
                  <div className="card" style={{ padding: 16 }}>
                    <div style={{ color: C.textDim, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Risk Score</div>
                    <div style={{ color: selectedCase.risk_score >= 80 ? C.critical : selectedCase.risk_score >= 60 ? C.high : C.medium, fontSize: 28, fontWeight: 800, marginTop: 4 }}>{selectedCase.risk_score}</div>
                  </div>
                </div>
                <Separator />
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ color: C.textDim, fontSize: 12, fontWeight: 600 }}>Linked Threats</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {selectedCase.threat_ids.split(",").map((t, i) => (
                      <Badge key={i} severity="high" size="sm">{t.trim()}</Badge>
                    ))}
                  </div>
                </div>
                <div style={{ color: C.textDim, fontSize: 12, fontWeight: 600 }}>Case Notes</div>
                <div className="card" style={{ padding: 14, color: C.text, lineHeight: 1.6, minHeight: 100 }}>{selectedCase.notes || "No notes added."}</div>
                <Separator />
                <div style={{ display: "grid", gap: 8 }}>
                  {CASE_STATUSES.filter(s => s !== "All").map((status) => (
                    <div key={status} style={{ display: "flex", justifyContent: "space-between", color: C.text, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                      <span>{status}</span>
                      <span style={{ color: statusColors[status.toLowerCase().replace(" ", "_")] || C.textDim }}>
                        {selectedCase.status.toLowerCase().replace(" ", "_") === status.toLowerCase().replace(" ", "_") ? "✓ Active" : "—"}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Button tone="accent">Generate SAR</Button>
                  <Button variant="outline" tone="slate">Create Case Note</Button>
                  <Button variant="outline" tone="slate">Add Evidence</Button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", color: C.textDim, padding: 60 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 12, opacity: 0.5 }}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="18" y1="8" x2="22" y2="12"></line><line x1="22" y1="8" x2="18" y2="12"></line></svg>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No case selected</div>
                <div style={{ fontSize: 13 }}>Select a case from the list to view details</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}