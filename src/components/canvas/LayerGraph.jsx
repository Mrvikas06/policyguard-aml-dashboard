import { C } from "../../theme/colors";

// ─────────────────────────────────────────────────────────────────────────────
// LayerGraph — SVG network graph showing transaction layering hops
// Rendered for R-013 (layering) and R-014 (circular) violations
// ─────────────────────────────────────────────────────────────────────────────

const NODES = (fromLabel, toLabel) => [
  { id: "O",  x: 50, y: 15, col: C.amber,  r: 9,  lbl: fromLabel },
  { id: "I1", x: 22, y: 42, col: C.orange, r: 7,  lbl: "I-01" },
  { id: "I2", x: 78, y: 42, col: C.orange, r: 7,  lbl: "I-02" },
  { id: "I3", x: 35, y: 70, col: C.orange, r: 6,  lbl: "I-03" },
  { id: "I4", x: 65, y: 70, col: C.orange, r: 6,  lbl: "I-04" },
  { id: "S",  x: 50, y: 92, col: C.red,    r: 10, lbl: toLabel },
];

const EDGES = [["O","I1"],["O","I2"],["I1","I3"],["I2","I4"],["I3","S"],["I4","S"]];

export function LayerGraph({ violation }) {
  const fromLbl = violation?.from?.slice(-4) || "ORIG";
  const toLbl   = violation?.to?.slice(-4)   || "SHELL";
  const nodes   = NODES(fromLbl, toLbl);

  return (
    <svg viewBox="0 0 100 106" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <defs>
        <marker id="arrowhead" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
          <path d="M0,0 L4,2 L0,4" fill={C.fog} />
        </marker>
      </defs>

      {/* Edges */}
      {EDGES.map(([a, b], i) => {
        const na = nodes.find((n) => n.id === a);
        const nb = nodes.find((n) => n.id === b);
        return (
          <line
            key={i}
            x1={na.x} y1={na.y}
            x2={nb.x} y2={nb.y}
            stroke={C.rimHi}
            strokeWidth="0.8"
            strokeDasharray="2,1.5"
            markerEnd="url(#arrowhead)"
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((n) => (
        <g key={n.id}>
          {/* Outer glow ring */}
          <circle cx={n.x} cy={n.y} r={n.r + 4} fill={n.col} opacity="0.08" />
          <circle cx={n.x} cy={n.y} r={n.r + 1} fill={n.col} opacity="0.18" />
          {/* Main node */}
          <circle cx={n.x} cy={n.y} r={n.r}     fill={n.col} opacity="0.85" />
          {/* Label */}
          <text
            x={n.x} y={n.y + 0.6}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="3.2"
            fill="#fff"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {n.lbl}
          </text>
        </g>
      ))}
    </svg>
  );
}
