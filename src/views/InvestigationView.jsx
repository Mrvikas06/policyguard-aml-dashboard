// ─────────────────────────────────────────────────────────────────────────────
// Investigation View — AI-powered threat investigation
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { C, formatNumber, formatCurrency, formatRelative, cn } from "../theme/colors";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import { Separator } from "../components/ui/Separator";
import { SectionHeading } from "../components/shared";
import { api } from "../services/api";

export function InvestigationView({ threat, onClose }) {
  const [question, setQuestion] = useState("Why was this transaction flagged?");
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [threatData, setThreatData] = useState(threat);

  useEffect(() => {
    if (threat) setThreatData(threat);
  }, [threat]);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      // Simulate AI response
      await new Promise(r => setTimeout(r, 1500));
      setAiResponse({
        riskScore: threatData?.riskScore || 94,
        confidence: 97,
        reasons: [
          "Transaction exceeds historical account behavior patterns",
          "Transaction velocity is 3.2x above normal threshold for this account type",
          "Funds moved through 4 intermediary accounts in 6 hours (layering pattern)",
          "Destination account has elevated risk score (87/100) and is in a high-risk jurisdiction",
          "Transaction amount ($75,000) exceeds account's 90-day average by 1,240%",
        ],
        evidence: "Transaction chain analysis reveals structured movement through ACC-2200 → ACC-6650 → ACC-7712 → ACC-3301 → ACC-9982 with timing consistent with layering methodology per FATF R.16.",
        relatedTxns: 12,
        relatedAccounts: 7,
        recommendedAction: "Immediate SAR filing required. Freeze all accounts in chain. Escalate to AML Compliance Director. Initiate 314(b) information sharing with counterpart institutions.",
      });
    } catch (e) {
      console.error("AI query failed:", e);
    } finally {
      setLoading(false);
    }
  };

  if (!threatData) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: 400, color: C.textDim }}>
        No threat selected for investigation
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <SectionHeading
        eyebrow="AI investigation"
        title={`${threatData.threat_id} · Investigation workspace`}
        description="Ask the model why a transaction was flagged and receive explainable reasons, evidence and recommendations."
        actions={[
          <Button key="close" variant="outline" tone="slate" onClick={onClose}>Close Investigation</Button>,
        ]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <CardHeader>
            <CardTitle>Ask the Assistant</CardTitle>
            <CardDescription>Example: "Why was this transaction flagged?" or "What evidence supports this threat?"</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 16 }}>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your investigation question..."
              style={{ minHeight: 100 }}
            />
            <Button tone="accent" onClick={handleAsk} loading={loading} disabled={loading || !question.trim()}>
              {loading ? "Analyzing..." : "Ask AI"}
            </Button>

            {aiResponse && (
              <div className="card card-elevated" style={{ borderColor: C.brand, padding: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 12, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.brand} strokeWidth="2"><path d="M12 2a10 10 0 0 1 10 10c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-1.7.47-3.29 1.3-4.7"></path><path d="M12 6v6l4 2"></path></svg>
                  AI RESPONSE
                </div>
                <div style={{ display: "grid", gap: 12, color: C.text }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                    <div className="card" style={{ padding: 16, textAlign: "center", background: C.criticalSoft }}>
                      <div style={{ color: C.textDim, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Risk Score</div>
                      <div style={{ color: C.critical, fontSize: 32, fontWeight: 800, marginTop: 4 }}>{aiResponse.riskScore}</div>
                    </div>
                    <div className="card" style={{ padding: 16, textAlign: "center", background: C.brandSoft }}>
                      <div style={{ color: C.textDim, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Confidence</div>
                      <div style={{ color: C.brand, fontSize: 32, fontWeight: 800, marginTop: 4 }}>{aiResponse.confidence}%</div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: C.text }}>WHY FLAGGED?</div>
                    <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8, color: C.text }}>
                      {aiResponse.reasons.map((r, i) => <li key={i}>{r}</li>)}
                    </ol>
                  </div>
                  <Separator />
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: C.text }}>EVIDENCE</div>
                    <div className="card" style={{ padding: 14, lineHeight: 1.7, background: C.surface }}>{aiResponse.evidence}</div>
                  </div>
                  <Separator />
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: C.text }}>RECOMMENDED ACTION</div>
                    <div className="card" style={{ padding: 14, lineHeight: 1.7, background: C.criticalSoft }}>{aiResponse.recommendedAction}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Threat Summary</CardTitle>
            <CardDescription>Risk score, transaction details, and rule explanation.</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge severity={threatData?.severity} size="sm" />
              <Badge variant="soft" color={C.ai}>{threatData?.rule_id || "R-001"}</Badge>
              <Badge status={threatData?.status || "open"} size="sm" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <div><div style={{ color: C.textDim, fontSize: 12 }}>Transaction</div><div className="text-mono" style={{ color: C.text, fontWeight: 700 }}>{threatData?.txn_id || "TXN-99825"}</div></div>
              <div><div style={{ color: C.textDim, fontSize: 12 }}>Amount</div><div className="text-mono" style={{ color: C.text, fontWeight: 700 }}>{formatCurrency(threatData?.amount || 12500)}</div></div>
              <div><div style={{ color: C.textDim, fontSize: 12 }}>Risk Score</div><div style={{ color: C.critical, fontWeight: 800, fontSize: 24 }}>{threatData?.riskScore || 94}</div></div>
            </div>
            <Separator />
            <div>
              <div style={{ color: C.textDim, fontSize: 12, marginBottom: 6 }}>Rule triggered</div>
              <div style={{ color: C.text, fontSize: 14, lineHeight: 1.65 }}>{threatData?.ruleText || "Single transaction exceeding $10,000 — mandatory CTR filing required per BSA §5313."}</div>
            </div>
            <div>
              <div style={{ color: C.textDim, fontSize: 12, marginBottom: 6 }}>AI explanation</div>
              <div style={{ color: C.text, fontSize: 14, lineHeight: 1.65 }}>{threatData?.evidence || "Transaction exceeds historical account behavior and shows a layered route through intermediary accounts."}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Case Actions</CardTitle>
            <CardDescription>Analyst workflow controls and evidence capture.</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 12 }}>
            {["Create case", "Generate SAR", "Export report", "Add analyst note"].map((label) => (
              <Button key={label} variant="outline" tone="slate" block>{label}</Button>
            ))}
            <Separator />
            <div style={{ color: C.textDim, fontSize: 12 }}>Evidence</div>
            <div className="card" style={{ padding: 14, color: C.text, lineHeight: 1.6 }}>{threatData?.remediation || "Evidence packet includes transaction chain, account history, and AI-generated rationale."}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}