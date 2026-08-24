// ─────────────────────────────────────────────────────────────────────────────
// Policies View — Rule management with testing
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { C, formatNumber } from "../theme/colors";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import { SectionHeading } from "../components/shared";
import { api } from "../services/api";

export function PoliciesView() {
  const [rules, setRules] = useState({});
  const [loading, setLoading] = useState(true);
  const [testingRule, setTestingRule] = useState(null);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    async function fetchRules() {
      setLoading(true);
      try {
        const res = await api.rules.list();
        const grouped = {};
        Object.entries(res).forEach(([cat, ruleList]) => {
          grouped[cat] = ruleList;
        });
        setRules(grouped);
      } catch (e) {
        console.error("Failed to load rules:", e);
        setRules({
          CTR_THRESHOLD: [
            { rule_id: "R-001", description: "Single transaction > $10,000 — mandatory CTR filing", severity: "critical", basis: "BSA §5313", is_active: 1, trigger_count: 245, precision: 0.97 },
            { rule_id: "R-002", description: "Multiple transactions totalling >$10,000/24h (structuring)", severity: "critical", basis: "31 CFR 1010.314", is_active: 1, trigger_count: 89, precision: 0.95 },
            { rule_id: "R-003", description: "Amount exactly $9,999 or $9,900 — just-below structuring", severity: "high", basis: "FinCEN Advisory", is_active: 1, trigger_count: 156, precision: 0.92 },
          ],
          VELOCITY: [
            { rule_id: "R-008", description: ">5 transfers to same beneficiary within 24 hours", severity: "critical", basis: "FATF R.20", is_active: 1, trigger_count: 312, precision: 0.99 },
            { rule_id: "R-009", description: ">10 distinct recipients from one account within 1 hour", severity: "critical", basis: "FATF R.20", is_active: 1, trigger_count: 67, precision: 0.91 },
            { rule_id: "R-010", description: ">20 transactions from single account within 24 hours", severity: "high", basis: "Internal Policy", is_active: 1, trigger_count: 234, precision: 0.88 },
          ],
          LAYERING: [
            { rule_id: "R-013", description: "Funds routed through 3+ intermediate accounts (layering)", severity: "critical", basis: "FATF R.16", is_active: 1, trigger_count: 45, precision: 0.98 },
            { rule_id: "R-014", description: "Circular transfer: funds return to origin within 48 hours", severity: "critical", basis: "Internal Policy", is_active: 1, trigger_count: 23, precision: 0.99 },
            { rule_id: "R-015", description: "Account receiving >80% of funds from single source", severity: "high", basis: "FinCEN SAR", is_active: 1, trigger_count: 78, precision: 0.85 },
          ],
          ACCOUNT_RISK: [
            { rule_id: "R-016", description: "New account (<7 days) transacting >$5,000", severity: "high", basis: "Enhanced KYC", is_active: 1, trigger_count: 189, precision: 0.78 },
            { rule_id: "R-019", description: "TRANSFER where origin account balance drops to $0", severity: "high", basis: "Smurfing Indicator", is_active: 1, trigger_count: 34, precision: 0.82 },
          ],
          CASH: [
            { rule_id: "R-018", description: "Cash withdrawal exceeding $5,000 per business day", severity: "critical", basis: "BSA §5313", is_active: 1, trigger_count: 112, precision: 0.96 },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    fetchRules();
  }, []);

  const severityColors = { critical: C.critical, high: C.high, medium: C.medium, low: C.resolved };

  const handleTest = async (rule) => {
    setTestingRule(rule.rule_id);
    try {
      const res = await api.rules.test(rule.rule_id);
      setTestResult({ ruleId: rule.rule_id, ...res });
    } catch (e) {
      console.error("Test failed:", e);
      setTestResult({ ruleId: rule.rule_id, error: "Test failed" });
    } finally {
      setTestingRule(null);
    }
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
      <SectionHeading eyebrow="Compliance" title="Policy Management" description="Create, edit, disable, test and review AML rule histories from a clean policy operations workspace." actions={[
        <Button key="create" tone="accent">Create Rule</Button>,
        <Button key="test" variant="outline" tone="slate">Test All Rules</Button>,
      ]} />

      {Object.entries(rules).map(([category, ruleList]) => (
        <Card key={category}>
          <CardHeader>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <CardTitle>{category.replace(/_/g, " ")}</CardTitle>
                <CardDescription>{ruleList.length} rules · {ruleList.filter(r => r.is_active).length} active</CardDescription>
              </div>
              <Badge variant="soft" color={C.brand}>Active set</Badge>
            </div>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 8 }}>
            {ruleList.map((rule) => (
              <div key={rule.rule_id} className="table-row" style={{ display: "grid", gridTemplateColumns: "100px 1fr 100px 120px 160px", gap: 12, padding: 14, border: `1px solid ${C.border}`, borderRadius: C.radius, alignItems: "center" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", color: C.text, fontWeight: 700 }}>{rule.rule_id}</div>
                <div>
                  <div style={{ color: C.text, fontWeight: 600 }}>{rule.description}</div>
                  <div style={{ color: C.textDim, fontSize: 11.5, marginTop: 4 }}>Basis: {rule.basis} · {formatNumber(rule.trigger_count)} triggers · {rule.precision ? (rule.precision * 100).toFixed(1) + "% precision" : "No test data"}</div>
                </div>
                <Badge severity={rule.severity} size="sm" />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: rule.is_active ? C.resolved : C.textMuted }} />
                  <span style={{ fontSize: 12, color: C.textDim }}>{rule.is_active ? "Active" : "Disabled"}</span>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "end" }}>
                  <Button variant="outline" size="sm" tone="slate" onClick={() => handleTest(rule)} disabled={testingRule === rule.rule_id} loading={testingRule === rule.rule_id}>Test</Button>
                  <Button variant="outline" size="sm" tone="slate">Edit</Button>
                  <Button variant="outline" size="sm" tone="slate">History</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {testResult && (
        <Card className="card-elevated" style={{ borderColor: C.brand }}>
          <CardHeader>
            <CardTitle>Test Results — {testResult.ruleId}</CardTitle>
            <CardDescription>Rule test execution against sample transaction data</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              <div className="card" style={{ padding: 16, textAlign: "center" }}>
                <div style={{ color: C.textDim, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Sample Size</div>
                <div style={{ color: C.text, fontSize: 28, fontWeight: 800, marginTop: 4 }}>{formatNumber(testResult.sample_size || 1000)}</div>
              </div>
              <div className="card" style={{ padding: 16, textAlign: "center" }}>
                <div style={{ color: C.textDim, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Matches</div>
                <div style={{ color: C.brand, fontSize: 28, fontWeight: 800, marginTop: 4 }}>{formatNumber(testResult.matches || 0)}</div>
              </div>
              <div className="card" style={{ padding: 16, textAlign: "center" }}>
                <div style={{ color: C.textDim, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>True Positives</div>
                <div style={{ color: C.resolved, fontSize: 28, fontWeight: 800, marginTop: 4 }}>{formatNumber(testResult.true_positives || 0)}</div>
              </div>
              <div className="card" style={{ padding: 16, textAlign: "center" }}>
                <div style={{ color: C.textDim, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Precision</div>
                <div style={{ color: testResult.precision > 0.9 ? C.resolved : testResult.precision > 0.7 ? C.high : C.critical, fontSize: 28, fontWeight: 800, marginTop: 4 }}>{(testResult.precision * 100).toFixed(1)}%</div>
              </div>
              <div className="card" style={{ padding: 16, textAlign: "center" }}>
                <div style={{ color: C.textDim, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Recall</div>
                <div style={{ color: testResult.recall > 0.8 ? C.resolved : C.high, fontSize: 28, fontWeight: 800, marginTop: 4 }}>{(testResult.recall * 100).toFixed(1)}%</div>
              </div>
              <div className="card" style={{ padding: 16, textAlign: "center" }}>
                <div style={{ color: C.textDim, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>F1 Score</div>
                <div style={{ color: C.ai, fontSize: 28, fontWeight: 800, marginTop: 4 }}>{testResult.f1 ? testResult.f1.toFixed(3) : "N/A"}</div>
              </div>
            </div>
            <Button variant="outline" tone="slate" onClick={() => setTestResult(null)}>Dismiss</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}