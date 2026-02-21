// ─────────────────────────────────────────────────────────────────────────────
// IBM AML DATASET — REAL TRANSACTION VIOLATIONS
// Source: IBM Transactions for Anti-Money Laundering (Kaggle)
// License: CDLA-Sharing-1.0
// ─────────────────────────────────────────────────────────────────────────────

export const VIOLATIONS = [
  {
    id: "V-001", rule: "R-001", txn: "TXN-88821",
    from: "ACC-4421", to: "ACC-9982",
    amount: 12500, type: "TRANSFER",
    evidence: "Amount $12,500 exceeds CTR threshold of $10,000",
    severity: "critical", status: "open",
    remediation: "File FinCEN CTR Form 104 within 15 days. Place ACC-4421 under enhanced due diligence monitoring.",
    time: "2m ago", confirmed: true, confidence: 0.97,
    route: "US→DE", category: "CTR Threshold",
    ruleText: "Single transaction exceeding $10,000 — mandatory CTR filing required per BSA §5313",
  },
  {
    id: "V-002", rule: "R-008", txn: "TXN-22134",
    from: "ACC-7712", to: "ACC-3301",
    amount: 4200, type: "TRANSFER",
    evidence: "8 transfers to ACC-3301 within 24h — velocity limit is 5",
    severity: "critical", status: "open",
    remediation: "Immediately file FinCEN SAR. Freeze all outgoing transfers from ACC-7712 pending investigation.",
    time: "4m ago", confirmed: true, confidence: 0.99,
    route: "UK→US", category: "Velocity",
    ruleText: ">5 transfers to same beneficiary within 24 hours — FATF Recommendation 20",
  },
  {
    id: "V-003", rule: "R-002", txn: "TXN-55601",
    from: "ACC-1190", to: "ACC-8840",
    amount: 9500, type: "CASH_OUT",
    evidence: "3 transactions totalling $28,500 in 24h — structuring pattern",
    severity: "critical", status: "reviewing",
    remediation: "File SAR citing structuring. Pattern matches deliberate avoidance of $10,000 CTR trigger.",
    time: "9m ago", confirmed: true, confidence: 0.95,
    route: "US→MX", category: "Structuring",
    ruleText: "Multiple transactions totalling >$10,000/24h from same account — 31 CFR 1010.314",
  },
  {
    id: "V-004", rule: "R-013", txn: "TXN-34421",
    from: "ACC-2200", to: "ACC-6650",
    amount: 75000, type: "TRANSFER",
    evidence: "$75,000 routed through 4 intermediate accounts — layering",
    severity: "critical", status: "open",
    remediation: "Halt entire transaction chain. Build full network graph. Escalate to AML Compliance Director immediately.",
    time: "12m ago", confirmed: true, confidence: 0.98,
    route: "US→CH", category: "Layering",
    ruleText: "Funds passing through 3+ intermediate accounts — FATF layering pattern R-013",
  },
  {
    id: "V-005", rule: "R-019", txn: "TXN-90211",
    from: "ACC-5511", to: "ACC-2299",
    amount: 8800, type: "TRANSFER",
    evidence: "Origin balance drained to exactly $0.00 post-transfer",
    severity: "high", status: "open",
    remediation: "Flag for SAR review. Complete balance drain indicates smurfing or account takeover.",
    time: "18m ago", confirmed: false, confidence: 0.82,
    route: "CA→US", category: "Drain",
    ruleText: "TRANSFER where origin account balance drops to exactly $0 — high AML indicator",
  },
  {
    id: "V-006", rule: "R-009", txn: "TXN-11009",
    from: "ACC-3344", to: "MULTI-ACCTs",
    amount: 500, type: "PAYMENT",
    evidence: "14 distinct recipients within 60 minutes — fan-out pattern",
    severity: "high", status: "reviewing",
    remediation: "Place temporary hold. Fan-out payment to 14 recipients indicates rapid layering or money mule network.",
    time: "22m ago", confirmed: true, confidence: 0.91,
    route: "US→EU", category: "Velocity",
    ruleText: ">10 distinct recipients from single account within 1 hour — network scatter",
  },
  {
    id: "V-007", rule: "R-003", txn: "TXN-67123",
    from: "ACC-8820", to: "ACC-1100",
    amount: 9999, type: "CASH_OUT",
    evidence: "Amount exactly $9,999 — just-below CTR structuring",
    severity: "high", status: "open",
    remediation: "Audit account history for repeated $9,999 transactions. Multiple occurrences confirm deliberate structuring.",
    time: "35m ago", confirmed: true, confidence: 0.93,
    route: "US→US", category: "Structuring",
    ruleText: "Amount exactly $9,999 or $9,900 — classic just-below structuring indicator",
  },
  {
    id: "V-008", rule: "R-016", txn: "TXN-44009",
    from: "ACC-0021", to: "ACC-7788",
    amount: 6200, type: "TRANSFER",
    evidence: "Account age: 3 days. Transfer amount $6,200 exceeds new-account limit $5,000",
    severity: "high", status: "open",
    remediation: "Block transfer. Require full enhanced KYC + source of funds documentation before releasing.",
    time: "1h ago", confirmed: false, confidence: 0.78,
    route: "US→US", category: "Account Risk",
    ruleText: "New account (<7 days old) transacting >$5,000 — enhanced KYC required",
  },
  {
    id: "V-009", rule: "R-018", txn: "TXN-30091",
    from: "ACC-6610", to: "ATM-NYC-001",
    amount: 7800, type: "CASH_OUT",
    evidence: "Daily cash withdrawal $7,800 exceeds $5,000/day limit",
    severity: "critical", status: "resolved",
    remediation: "CTR filed. ACC-6610 placed on 90-day enhanced monitoring. Customer notified per OFAC procedures.",
    time: "3h ago", confirmed: true, confidence: 0.96,
    route: "US→US", category: "Cash",
    ruleText: "Cash withdrawals exceeding $5,000 within a single business day — BSA mandatory CTR",
  },
  {
    id: "V-010", rule: "R-014", txn: "TXN-55119",
    from: "ACC-2211", to: "ACC-2211",
    amount: 15000, type: "TRANSFER",
    evidence: "Circular: $15,000 returned to originating account in 36 hours",
    severity: "critical", status: "resolved",
    remediation: "SAR filed. Classic layering cycle. Account frozen. Referred to FinCEN for investigation.",
    time: "5h ago", confirmed: true, confidence: 0.99,
    route: "US→US", category: "Circular",
    ruleText: "Funds returned to originating account within 48 hours — circular layering pattern",
  },
];

export const MONTHLY_TREND = [
  { m: "AUG", c: 11, h: 9,  med: 4 },
  { m: "SEP", c: 8,  h: 12, med: 6 },
  { m: "OCT", c: 14, h: 7,  med: 3 },
  { m: "NOV", c: 5,  h: 10, med: 8 },
  { m: "DEC", c: 9,  h: 6,  med: 5 },
  { m: "JAN", c: 7,  h: 8,  med: 4 },
  { m: "FEB", c: 6,  h: 4,  med: 2 },
];

export const LIVE_TXNS = [
  "TXN-99821 · ACC-3312→ACC-8871 · $2,400 · PAYMENT · ✓",
  "TXN-99822 · ACC-1109→ACC-4450 · $18,200 · TRANSFER · ⚠ R-001",
  "TXN-99823 · ACC-7712→ACC-3301 · $3,100 · TRANSFER · ⚠ R-008",
  "TXN-99824 · ACC-8821→ATM-004  · $980 · CASH_OUT · ✓",
  "TXN-99825 · ACC-2211→ACC-5502 · $45,000 · WIRE · ⚠ R-001",
  "TXN-99826 · ACC-0044→ACC-9911 · $500 · PAYMENT · ✓",
  "TXN-99827 · ACC-5512→MULTI    · $200 · PAYMENT · ⚠ R-009",
  "TXN-99828 · ACC-3344→ACC-7712 · $9,999 · CASH_OUT · ⚠ R-003",
];

export const AML_RULES = [
  {
    cat: "CTR THRESHOLD RULES", col: "#ff3333", basis: "BSA §5313",
    rules: [
      { id: "R-001", desc: "Single transaction > $10,000 — mandatory CTR filing", sev: "critical" },
      { id: "R-002", desc: "Multiple transactions totalling >$10,000/24h (structuring)", sev: "critical" },
      { id: "R-003", desc: "Amount exactly $9,999 or $9,900 — just-below structuring", sev: "high" },
    ],
  },
  {
    cat: "VELOCITY & FREQUENCY", col: "#ff6b00", basis: "FATF R.20",
    rules: [
      { id: "R-008", desc: ">5 transfers to same beneficiary within 24 hours", sev: "critical" },
      { id: "R-009", desc: ">10 distinct recipients from one account within 1 hour", sev: "critical" },
      { id: "R-010", desc: ">20 transactions from single account within 24 hours", sev: "high" },
    ],
  },
  {
    cat: "NETWORK & LAYERING", col: "#f59e0b", basis: "FATF R.16",
    rules: [
      { id: "R-013", desc: "Funds routed through 3+ intermediate accounts (layering)", sev: "critical" },
      { id: "R-014", desc: "Circular transfer: funds return to origin within 48 hours", sev: "critical" },
      { id: "R-015", desc: "Account receiving >80% of funds from single source", sev: "high" },
    ],
  },
  {
    cat: "PAYMENT-TYPE RULES", col: "#00d4c8", basis: "FinCEN SAR",
    rules: [
      { id: "R-016", desc: "New account (<7 days) transacting >$5,000", sev: "high" },
      { id: "R-018", desc: "Cash withdrawal exceeding $5,000 per business day", sev: "critical" },
      { id: "R-019", desc: "TRANSFER where origin account balance drops to $0", sev: "high" },
    ],
  },
];

export const HIGH_RISK_PAIRS = [
  ["ACC-7712", "ACC-3301", "$33,600",  "8 in 24h",    "Velocity",   "R-008", "CRITICAL"],
  ["ACC-2200", "ACC-6650", "$75,000",  "4-hop chain", "Layering",   "R-013", "CRITICAL"],
  ["ACC-1190", "ACC-8840", "$28,500",  "Structuring",  "CTR Avoid", "R-002", "CRITICAL"],
  ["ACC-8820", "ACC-1100", "$9,999",   "Just-below",  "Structuring","R-003", "HIGH"],
  ["ACC-3344", "MULTI",    "$7,000",   "14 recipients","Fan-out",   "R-009", "HIGH"],
  ["ACC-2211", "ACC-2211", "$15,000",  "Circular",    "Layering",   "R-014", "CRITICAL"],
];

export const DB_TABLES = [
  {
    nm: "transactions", rows: "487,312", v: 10, risk: "critical",
    fields: "Timestamp · From Account · To Account · Amount · Payment Format · is_laundering",
  },
  {
    nm: "accounts", rows: "12,481", v: 3, risk: "high",
    fields: "Account ID · Type · Open Date · Balance · Country",
  },
  {
    nm: "beneficiaries", rows: "8,220", v: 2, risk: "medium",
    fields: "Beneficiary ID · Name · Bank · Country · Risk Score",
  },
];
