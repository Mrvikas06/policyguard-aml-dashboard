// ─────────────────────────────────────────────────────────────────────────────
// Network View — Transaction network graph with path analysis
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from "react";
import { C, formatNumber, formatCurrency, formatRelative } from "../theme/colors";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { SectionHeading } from "../components/shared";
import { api } from "../services/api";

export function NetworkView() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [highRiskPairs, setHighRiskPairs] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNetwork() {
      setLoading(true);
      try {
        const [graphRes, pairsRes] = await Promise.all([
          api.network.graph({ limit: 500, min_amount: 1000 }),
          api.network.highRiskPairs(),
        ]);
        setGraphData({ nodes: graphRes.nodes || [], links: graphRes.links || [] });
        setHighRiskPairs(pairsRes || []);
      } catch (e) {
        console.error("Failed to load network:", e);
        // Mock data
        setGraphData({
          nodes: Array.from({ length: 12 }, (_, i) => ({
            id: `ACC-${String(1000 + i).padStart(4, "0")}`,
            account: `ACC-${String(1000 + i).padStart(4, "0")}`,
            risk: [C.critical, C.high, C.medium, C.resolved][i % 4],
            country: ["US", "GB", "DE", "FR"][i % 4],
          })),
          links: [
            { source: "ACC-1000", target: "ACC-1001", amount: 25000, txn_id: "TXN-10001", flagged: true },
            { source: "ACC-1001", target: "ACC-1002", amount: 18000, txn_id: "TXN-10002", flagged: true },
            { source: "ACC-1002", target: "ACC-1003", amount: 35000, txn_id: "TXN-10003", flagged: false },
            { source: "ACC-1001", target: "ACC-1004", amount: 12000, txn_id: "TXN-10004", flagged: true },
            { source: "ACC-1004", target: "ACC-1005", amount: 8000, txn_id: "TXN-10005", flagged: false },
            { source: "ACC-1003", target: "ACC-1006", amount: 45000, txn_id: "TXN-10006", flagged: true },
            { source: "ACC-1000", target: "ACC-1004", amount: 22000, txn_id: "TXN-10007", flagged: false },
          ],
        });
        setHighRiskPairs([
          { from_account: "ACC-1000", to_account: "ACC-1001", txn_count: 8, total_amount: 33600, severity: "critical" },
          { from_account: "ACC-1001", to_account: "ACC-1002", txn_count: 4, total_amount: 75000, severity: "critical" },
          { from_account: "ACC-1002", to_account: "ACC-1003", txn_count: 3, total_amount: 28500, severity: "critical" },
          { from_account: "ACC-1003", to_account: "ACC-1004", txn_count: 2, total_amount: 9999, severity: "high" },
          { from_account: "ACC-1004", to_account: "ACC-1005", txn_count: 14, total_amount: 7000, severity: "high" },
          { from_account: "ACC-1000", to_account: "ACC-1000", txn_count: 1, total_amount: 15000, severity: "critical" },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchNetwork();
  }, []);

  const nodePositions = useMemo(() => {
    const positions = {};
    const radius = 280;
    const centerX = 340;
    const centerY = 200;
    graphData.nodes.forEach((node, i) => {
      const angle = (i / graphData.nodes.length) * Math.PI * 2;
      positions[node.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
    return positions;
  }, [graphData.nodes]);

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
      <SectionHeading eyebrow="Network analytics" title="Transaction Network" description="Interactive graph, account details, suspicious path highlighting and explainable AI controls." />
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        <Card>
          <CardHeader>
            <CardTitle>Network Graph</CardTitle>
            <CardDescription>Zoom, pan, node selection — click nodes to inspect connections</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ position: "relative", minHeight: 400 }}>
              <NetworkGraph
                nodes={graphData.nodes}
                links={graphData.links}
                positions={nodePositions}
                selectedNode={selectedNode}
                onNodeClick={setSelectedNode}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Selected node information</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 12 }}>
            {selectedNode ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: C.text, fontSize: 16 }}>{selectedNode.account}</div>
                    <div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>Risk Score: {selectedNode.risk_score || Math.floor(Math.random() * 100)}</div>
                  </div>
                  <Badge severity={selectedNode.risk > 70 ? "critical" : selectedNode.risk > 50 ? "high" : selectedNode.risk > 30 ? "medium" : "low"} size="sm" />
                </div>
                <Separator />
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: C.textDim }}>Connections</span><span style={{ fontWeight: 600 }}>{Math.floor(Math.random() * 10) + 1}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: C.textDim }}>Total Volume</span><span style={{ fontWeight: 600 }}>{formatCurrency(Math.random() * 100000)}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: C.textDim }}>Country</span><span style={{ fontWeight: 600 }}>{selectedNode.country || "US"}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: C.textDim }}>Threats Linked</span><span style={{ fontWeight: 600, color: C.critical }}>{Math.floor(Math.random() * 5)}</span></div>
                </div>
                <Button tone="accent" block>Generate Path Explanation</Button>
              </>
            ) : (
              <div style={{ textAlign: "center", color: C.textDim, padding: 40 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 12, opacity: 0.5 }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No account selected</div>
                <div style={{ fontSize: 13 }}>Click a node in the graph to view details</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>High-Risk Account Pairs</CardTitle>
          <CardDescription>Top suspicious account-to-account relationships by volume and flagged activity</CardDescription>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          <table className="data-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>From Account</th>
                <th>To Account</th>
                <th>Transactions</th>
                <th>Total Volume</th>
                <th>Avg Amount</th>
                <th>Risk Level</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {highRiskPairs.map((pair, i) => (
                <tr key={i} className="table-row">
                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{pair.from_account}</td>
                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{pair.to_account}</td>
                  <td style={{ color: C.textDim }}>{pair.txn_count}</td>
                  <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatCurrency(pair.total_amount)}</td>
                  <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatCurrency(pair.total_amount / pair.txn_count)}</td>
                  <td><Badge severity={pair.severity} size="sm" dot /></td>
                  <td><Button variant="ghost" size="sm" tone="accent">Trace</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function NetworkGraph({ nodes, links, positions, selectedNode, onNodeClick }) {
  return (
    <svg viewBox="0 0 680 400" style={{ width: "100%", height: "auto", cursor: "default" }}>
      <defs>
        <marker id="net-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5" fill={C.borderLight} />
        </marker>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      
      {/* Grid background */}
      <g style={{ opacity: 0.15 }}>
        {[...Array(15)].map((_, i) => (
          <line key={i} x1={i * 48} y1={0} x2={i * 48} y2={400} stroke={C.border} strokeWidth={1} />
        ))}
        {[...Array(9)].map((_, i) => (
          <line key={i} x1={0} y1={i * 48} x2={680} y2={i * 48} stroke={C.border} strokeWidth={1} />
        ))}
      </g>

      {/* Links */}
      {links.map((link, idx) => {
        const source = positions[link.source];
        const target = positions[link.target];
        if (!source || !target) return null;
        const isFlagged = link.flagged;
        return (
          <line
            key={idx}
            x1={source.x} y1={source.y} x2={target.x} y2={target.y}
            stroke={isFlagged ? C.brand : C.borderLight}
            strokeWidth={isFlagged ? 2.5 : 1.5}
            strokeDasharray={isFlagged ? "0" : "4 4"}
            opacity={isFlagged ? 0.9 : 0.4}
            strokeLinecap="round"
            markerEnd="url(#net-arrow)"
            filter={isFlagged ? "url(#glow)" : "none"}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        const pos = positions[node.id];
        if (!pos) return null;
        const isSelected = selectedNode?.id === node.id;
        const riskColor = node.risk;
        return (
          <g key={node.id} onClick={() => onNodeClick(node)} style={{ cursor: "pointer", filter: isSelected ? "url(#glow)" : "none" }}>
            <circle
              cx={pos.x} cy={pos.y}
              r={isSelected ? 22 : 16}
              fill="#fff"
              stroke={isSelected ? C.brand : riskColor}
              strokeWidth={isSelected ? 3.5 : 2.5}
              style={{ transition: "all 0.2s ease" }}
            />
            <circle cx={pos.x} cy={pos.y} r={isSelected ? 6 : 4} fill={riskColor} />
            {isSelected && (
              <circle cx={pos.x} cy={pos.y} r={26} fill="none" stroke={C.brand} strokeWidth={2} strokeDasharray="4 4" opacity={0.6} />
            )}
            <text x={pos.x} y={pos.y + 35} textAnchor="middle" fontSize="11" fill={C.textDim} fontWeight={isSelected ? 700 : 500} style={{ fontFamily: "'Inter', sans-serif", pointerEvents: "none" }}>{node.account}</text>
          </g>
        );
      })}
    </svg>
  );
}