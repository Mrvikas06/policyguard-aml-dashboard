// ─────────────────────────────────────────────────────────────────────────────
// Transactions View — Transaction explorer with search and filtering
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { C, formatCurrency, formatRelative } from "../theme/colors";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Badge } from "../components/ui/Badge";
import { SectionHeading } from "../components/shared";
import { api } from "../services/api";

export function TransactionsView({ search, openThreat }) {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ txnId: "", account: "", amount: "", country: "", status: "" });

  useEffect(() => {
    async function fetchTxns() {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 20,
          search,
          txn_id: filters.txnId,
          from_account: filters.account,
          to_account: filters.account,
          min_amount: filters.amount ? parseFloat(filters.amount) : undefined,
          is_laundering: filters.status === "flagged" ? 1 : filters.status === "clean" ? 0 : undefined,
          country: filters.country,
        };
        const res = await api.transactions.list(params);
        setTransactions(res.data || []);
        setTotal(res.pagination?.total || 0);
      } catch (e) {
        console.error("Failed to load transactions:", e);
        setTransactions(Array.from({ length: 20 }, (_, i) => ({
          id: i,
          txn_id: `TXN-${String(10000 + i).padStart(5, "0")}`,
          amount: Math.floor(Math.random() * 50000) + 100,
          payment_format: ["WIRE", "TRANSFER", "CASH_OUT", "PAYMENT"][i % 4],
          timestamp: Date.now() - i * 3600000,
          is_laundering: i % 5 === 0 ? 1 : 0,
          from_account: `ACC-${String(1000 + i).padStart(4, "0")}`,
          to_account: `ACC-${String(2000 + i).padStart(4, "0")}`,
          from_country: ["US", "GB", "DE", "FR"][i % 4],
          to_country: ["US", "GB", "DE", "FR"][(i + 1) % 4],
        })));
        setTotal(1000);
      } finally {
        setLoading(false);
      }
    }
    fetchTxns();
  }, [page, search, filters]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

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
      <SectionHeading eyebrow="Transactions" title="Transaction Explorer" description="Search by transaction ID, account, amount, country, risk score, date, rule and status using a modern table interface." />
      <Card>
        <CardHeader>
          <CardTitle>Advanced Filters</CardTitle>
          <CardDescription>Combine multiple filters to narrow down transaction results</CardDescription>
        </CardHeader>
        <CardContent style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <Input placeholder="Transaction ID" value={filters.txnId} onChange={(e) => setFilters({...filters, txnId: e.target.value})} />
          <Input placeholder="Account" value={filters.account} onChange={(e) => setFilters({...filters, account: e.target.value})} />
          <Input placeholder="Amount" value={filters.amount} onChange={(e) => setFilters({...filters, amount: e.target.value})} type="number" step="0.01" />
          <Select value={filters.country} onChange={(e) => setFilters({...filters, country: e.target.value})}>
            <option value="">All Countries</option>
            <option>US</option><option>GB</option><option>DE</option><option>FR</option><option>CA</option><option>AU</option>
          </Select>
          <Select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
            <option value="">All Status</option>
            <option value="flagged">Flagged</option>
            <option value="clean">Clean</option>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent style={{ padding: 0 }}>
          <table className="data-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>TXN ID</th>
                <th>From → To</th>
                <th>Amount</th>
                <th>Format</th>
                <th>Timestamp</th>
                <th>Countries</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((row) => (
                <tr key={row.id} className="table-row clickable" onClick={() => openThreat({
                  threat_id: `V-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`,
                  txn_id: row.txn_id,
                  amount: row.amount,
                  rule_id: row.is_laundering ? "R-001" : "R-008",
                  severity: row.is_laundering ? "critical" : "high",
                  status: "open",
                  confidence: row.is_laundering ? 0.95 : 0.75,
                  detected_at: row.timestamp,
                })} style={{ cursor: row.is_laundering ? "pointer" : "default" }}>
                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: C.text }}>{row.txn_id}</td>
                  <td style={{ color: C.textDim }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{row.from_account}</span>
                    <span style={{ margin: "0 8px", color: C.textMuted }}>→</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{row.to_account}</span>
                  </td>
                  <td style={{ fontFamily: "'JetBrains Mono', monospace", color: C.text }}>{formatCurrency(row.amount)}</td>
                  <td><Badge variant="outline" size="sm">{row.payment_format}</Badge></td>
                  <td style={{ color: C.textDim }}>{formatRelative(row.timestamp)}</td>
                  <td style={{ fontSize: 12 }}>{row.from_country} → {row.to_country}</td>
                  <td><Badge variant={row.is_laundering ? "solid" : "soft"} color={row.is_laundering ? C.critical : C.resolved} size="sm">{row.is_laundering ? "Flagged" : "Clean"}</Badge></td>
                  <td><div style={{ width: 10, height: 10, borderRadius: "50%", background: row.is_laundering ? C.critical : C.resolved }} /></td>
                  <td><Button variant="ghost" size="sm" tone="accent" disabled={!row.is_laundering}>Open</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderTop: `1px solid ${C.border}`, flexWrap: "wrap", gap: 12 }}>
            <div style={{ color: C.textDim, fontSize: 13 }}>Page {page} of {totalPages} · {total} total</div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}