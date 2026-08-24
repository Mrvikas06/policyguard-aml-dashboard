import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import db from './init.js';

const PASSWORD_HASH = bcrypt.hashSync('password123', 10);

const countries = ['US', 'GB', 'DE', 'FR', 'CA', 'AU', 'JP', 'CH', 'SG', 'HK', 'AE', 'MX', 'BR', 'IN', 'NL'];
const accountTypes = ['checking', 'savings', 'business', 'investment', 'credit'];
const paymentFormats = ['WIRE', 'TRANSFER', 'CASH_OUT', 'PAYMENT', 'ACH', 'SWIFT', 'SEPA'];
const ruleCategories = [
  { cat: 'CTR_THRESHOLD', basis: 'BSA §5313', color: '#ef4444' },
  { cat: 'VELOCITY', basis: 'FATF R.20', color: '#f97316' },
  { cat: 'STRUCTURING', basis: '31 CFR 1010.314', color: '#f59e0b' },
  { cat: 'LAYERING', basis: 'FATF R.16', color: '#06b6d4' },
  { cat: 'ACCOUNT_RISK', basis: 'FinCEN SAR', color: '#8b5cf6' },
  { cat: 'CASH', basis: 'BSA §5313', color: '#ec4899' }
];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateAccountNumber() {
  return 'ACC-' + String(randomInt(1000, 9999));
}

function generateTxnId() {
  return 'TXN-' + String(randomInt(10000, 99999));
}

function generateThreatId() {
  return 'V-' + String(randomInt(1, 9999)).padStart(4, '0');
}

function generateRuleId(category) {
  const prefix = category.substring(0, 3).toUpperCase();
  return `${prefix}-${String(randomInt(1, 999)).padStart(3, '0')}`;
}

function generateCaseId() {
  return 'CASE-' + String(randomInt(1000, 9999));
}

const now = Date.now();
const oneYearAgo = new Date(now - 365 * 24 * 60 * 60 * 1000);
const sixMonthsAgo = new Date(now - 180 * 24 * 60 * 60 * 1000);
const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

console.log('Seeding database...');

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (id, email, password_hash, name, role, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const users = [
  { id: randomUUID(), email: 'meredith.lane@policyguard.ai', name: 'Meredith Lane', role: 'compliance_lead' },
  { id: randomUUID(), email: 'sarah.chen@policyguard.ai', name: 'Sarah Chen', role: 'senior_analyst' },
  { id: randomUUID(), email: 'marcus.patel@policyguard.ai', name: 'Marcus Patel', role: 'analyst' },
  { id: randomUUID(), email: 'alex.gomez@policyguard.ai', name: 'Alex Gomez', role: 'analyst' },
  { id: randomUUID(), email: 'lisa.khan@policyguard.ai', name: 'Lisa Khan', role: 'analyst' },
  { id: randomUUID(), email: 'admin@policyguard.ai', name: 'System Admin', role: 'admin' }
];

for (const u of users) {
  insertUser.run(u.id, u.email, PASSWORD_HASH, u.name, u.role, now - randomInt(0, 365 * 24 * 60 * 60 * 1000));
}

console.log(`Seeded ${users.length} users`);

const insertAccount = db.prepare(`
  INSERT OR IGNORE INTO accounts (id, account_number, account_type, open_date, balance, country, risk_score, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const accounts = [];
const accountMap = new Map();

for (let i = 0; i < 200; i++) {
  const id = randomUUID();
  const accNum = generateAccountNumber();
  const type = randomChoice(accountTypes);
  const openDate = randomDate(new Date(2015, 0, 1), new Date(2023, 11, 31)).getTime();
  const balance = Math.random() * 500000;
  const country = randomChoice(countries);
  const riskScore = Math.random() < 0.1 ? randomInt(70, 95) : Math.random() < 0.2 ? randomInt(40, 69) : randomInt(0, 39);
  const status = riskScore > 80 ? 'flagged' : 'active';
  
  insertAccount.run(id, accNum, type, openDate, balance, country, riskScore, status);
  accounts.push({ id, account_number: accNum, country, risk_score: riskScore });
  accountMap.set(accNum, id);
}

console.log(`Seeded ${accounts.length} accounts`);

const accountIds = accounts.map(a => a.id);

const insertTransaction = db.prepare(`
  INSERT OR IGNORE INTO transactions (id, txn_id, from_account_id, to_account_id, amount, currency, payment_format, timestamp, is_laundering)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const transactions = [];
const launderingPatterns = [];

for (let i = 0; i < 5000; i++) {
  const id = randomUUID();
  const txnId = generateTxnId();
  let fromId, toId;
  
  if (i < 500 && launderingPatterns.length < 50) {
    fromId = randomChoice(accountIds);
    toId = randomChoice(accountIds.filter(a => a !== fromId));
    if (Math.random() < 0.3) {
      launderingPatterns.push({ fromId, toId, pattern: 'structuring' });
    }
  } else if (i < 1000 && launderingPatterns.length < 100) {
    const pattern = randomChoice(launderingPatterns);
    fromId = pattern.fromId;
    toId = randomChoice(accountIds.filter(a => a !== fromId));
    if (Math.random() < 0.2) {
      launderingPatterns.push({ fromId, toId, pattern: 'layering' });
    }
  } else {
    fromId = randomChoice(accountIds);
    toId = randomChoice(accountIds.filter(a => a !== fromId));
  }
  
  let amount, isLaundering = 0;
  const rand = Math.random();
  
  if (rand < 0.02) {
    amount = randomInt(10000, 100000);
    isLaundering = 1;
  } else if (rand < 0.05) {
    amount = randomInt(9000, 9999);
    isLaundering = Math.random() < 0.5 ? 1 : 0;
  } else if (rand < 0.1) {
    amount = randomInt(5000, 15000);
  } else {
    amount = randomInt(10, 10000);
  }
  
  const timestamp = randomDate(oneYearAgo, new Date()).getTime();
  const format = randomChoice(paymentFormats);
  
  insertTransaction.run(id, txnId, fromId, toId, amount, 'USD', format, timestamp, isLaundering);
  transactions.push({ id, txn_id: txnId, from_account_id: fromId, to_account_id: toId, amount, timestamp, is_laundering: isLaundering, payment_format: format });
}

console.log(`Seeded ${transactions.length} transactions (${transactions.filter(t => t.is_laundering).flagged} flagged)`);

const insertRule = db.prepare(`
  INSERT OR IGNORE INTO rules (id, rule_id, category, description, severity, basis, is_active, trigger_count, last_triggered, precision)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const rules = [
  { rule_id: 'R-001', category: 'CTR_THRESHOLD', description: 'Single transaction > $10,000 — mandatory CTR filing', severity: 'critical', basis: 'BSA §5313', precision: 0.97 },
  { rule_id: 'R-002', category: 'STRUCTURING', description: 'Multiple transactions totalling >$10,000/24h (structuring)', severity: 'critical', basis: '31 CFR 1010.314', precision: 0.95 },
  { rule_id: 'R-003', category: 'STRUCTURING', description: 'Amount exactly $9,999 or $9,900 — just-below structuring', severity: 'high', basis: 'FinCEN Advisory', precision: 0.92 },
  { rule_id: 'R-008', category: 'VELOCITY', description: '>5 transfers to same beneficiary within 24 hours', severity: 'critical', basis: 'FATF R.20', precision: 0.99 },
  { rule_id: 'R-009', category: 'VELOCITY', description: '>10 distinct recipients from one account within 1 hour', severity: 'critical', basis: 'FATF R.20', precision: 0.91 },
  { rule_id: 'R-010', category: 'VELOCITY', description: '>20 transactions from single account within 24 hours', severity: 'high', basis: 'Internal Policy', precision: 0.88 },
  { rule_id: 'R-013', category: 'LAYERING', description: 'Funds routed through 3+ intermediate accounts (layering)', severity: 'critical', basis: 'FATF R.16', precision: 0.98 },
  { rule_id: 'R-014', category: 'LAYERING', description: 'Circular transfer: funds return to origin within 48 hours', severity: 'critical', basis: 'Internal Policy', precision: 0.99 },
  { rule_id: 'R-015', category: 'LAYERING', description: 'Account receiving >80% of funds from single source', severity: 'high', basis: 'FinCEN SAR', precision: 0.85 },
  { rule_id: 'R-016', category: 'ACCOUNT_RISK', description: 'New account (<7 days) transacting >$5,000', severity: 'high', basis: 'Enhanced KYC', precision: 0.78 },
  { rule_id: 'R-018', category: 'CASH', description: 'Cash withdrawal exceeding $5,000 per business day', severity: 'critical', basis: 'BSA §5313', precision: 0.96 },
  { rule_id: 'R-019', category: 'ACCOUNT_RISK', description: 'TRANSFER where origin account balance drops to $0', severity: 'high', basis: 'Smurfing Indicator', precision: 0.82 },
];

for (const r of rules) {
  insertRule.run(randomUUID(), r.rule_id, r.category, r.description, r.severity, r.basis, 1, randomInt(10, 500), now - randomInt(0, 7 * 24 * 60 * 60 * 1000), r.precision);
}

console.log(`Seeded ${rules.length} rules`);

const ruleIds = rules.map(r => r.rule_id);

const insertThreat = db.prepare(`
  INSERT OR IGNORE INTO threats (id, threat_id, rule_id, transaction_id, severity, status, confidence, evidence, remediation, detected_at, resolved_at, assigned_to)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const launderingTxns = transactions.filter(t => t.is_laundering);
const threats = [];

for (let i = 0; i < Math.min(200, launderingTxns.length); i++) {
  const t = launderingTxns[i];
  const id = randomUUID();
  const threatId = generateThreatId();
  const ruleId = randomChoice(ruleIds);
  const rule = rules.find(r => r.rule_id === ruleId);
  const severity = rule.severity;
  const status = Math.random() < 0.3 ? 'resolved' : Math.random() < 0.5 ? 'investigating' : 'open';
  const confidence = 0.75 + Math.random() * 0.24;
  const detectedAt = t.timestamp + randomInt(60000, 3600000);
  const resolvedAt = status === 'resolved' ? detectedAt + randomInt(3600000, 7 * 24 * 60 * 60 * 1000) : null;
  const assignedTo = status !== 'open' ? randomChoice(users.filter(u => u.role !== 'admin')).id : null;
  
  const evidence = generateEvidence(ruleId, t);
  const remediation = generateRemediation(ruleId, t);
  
  insertThreat.run(id, threatId, ruleId, t.id, severity, status, confidence, evidence, remediation, detectedAt, resolvedAt, assignedTo);
  threats.push({ threat_id: threatId, rule_id: ruleId, transaction_id: t.id, severity, status, confidence });
}

function generateEvidence(ruleId, txn) {
  const templates = {
    'R-001': `Amount $${txn.amount.toLocaleString()} exceeds CTR threshold of $10,000`,
    'R-002': `${randomInt(3, 8)} transactions totalling $${(txn.amount * randomInt(2, 5)).toLocaleString()} in 24h — structuring pattern`,
    'R-003': `Amount exactly $${txn.amount.toLocaleString()} — just-below CTR structuring indicator`,
    'R-008': `${randomInt(6, 15)} transfers to same beneficiary within 24h — velocity limit exceeded`,
    'R-009': `${randomInt(11, 25)} distinct recipients within 1 hour — fan-out pattern`,
    'R-013': `$${txn.amount.toLocaleString()} routed through ${randomInt(3, 6)} intermediate accounts — layering`,
    'R-014': `Circular: $${txn.amount.toLocaleString()} returned to originating account in ${randomInt(12, 48)} hours`,
    'R-016': `Account age: ${randomInt(1, 6)} days. Transfer amount $${txn.amount.toLocaleString()} exceeds new-account limit $5,000`,
    'R-018': `Daily cash withdrawal $${txn.amount.toLocaleString()} exceeds $5,000/day limit`,
    'R-019': `Origin balance drained to exactly $0.00 post-transfer`
  };
  return templates[ruleId] || 'Suspicious activity detected by AML engine';
}

function generateRemediation(ruleId, txn) {
  const templates = {
    'R-001': 'File FinCEN CTR Form 104 within 15 days. Place account under enhanced due diligence monitoring.',
    'R-002': 'File SAR citing structuring. Pattern matches deliberate avoidance of $10,000 CTR trigger.',
    'R-003': 'Audit account history for repeated just-below transactions. Multiple occurrences confirm structuring.',
    'R-008': 'Immediately file FinCEN SAR. Freeze all outgoing transfers pending investigation.',
    'R-009': 'Place temporary hold. Fan-out payment indicates rapid layering or money mule network.',
    'R-013': 'Halt entire transaction chain. Build full network graph. Escalate to AML Compliance Director.',
    'R-014': 'SAR filed. Classic layering cycle. Account frozen. Referred to FinCEN for investigation.',
    'R-016': 'Block transfer. Require full enhanced KYC + source of funds documentation before releasing.',
    'R-018': 'CTR filed. Account placed on 90-day enhanced monitoring. Customer notified per OFAC procedures.',
    'R-019': 'Flag for SAR review. Complete balance drain indicates smurfing or account takeover.'
  };
  return templates[ruleId] || 'Standard AML investigation procedure initiated.';
}

console.log(`Seeded ${threats.length} threats`);

const insertCase = db.prepare(`
  INSERT OR IGNORE INTO cases (id, case_id, threat_ids, status, analyst_id, risk_score, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const caseStatuses = ['new', 'investigating', 'escalated', 'awaiting_review', 'resolved', 'false_positive'];
const caseAnalysts = users.filter(u => u.role !== 'admin');

for (let i = 0; i < 25; i++) {
  const id = randomUUID();
  const caseId = generateCaseId();
  const threatCount = randomInt(1, 4);
  const caseThreats = threats.slice(i * threatCount, (i + 1) * threatCount).map(t => t.threat_id).join(',');
  const status = randomChoice(caseStatuses);
  const analyst = randomChoice(caseAnalysts);
  const riskScore = randomInt(60, 98);
  const notes = `Case ${caseId}: ${threatCount} threat(s) linked. ${status === 'resolved' ? 'SAR filed and monitoring retained.' : 'Under active investigation.'}`;
  
  insertCase.run(id, caseId, caseThreats, status, analyst.id, riskScore, notes);
}

console.log('Seeded 25 cases');

const insertAudit = db.prepare(`
  INSERT INTO audit_log (id, timestamp, action, actor, entity_type, entity_id, details, ip_address, user_agent)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const auditActions = [
  { action: 'Threat escalated to case', actor: 'Automated Rules Engine', entity: 'threat' },
  { action: 'SAR draft generated', actor: 'AI Assistant', entity: 'case' },
  { action: 'Policy test executed', actor: 'Compliance Ops', entity: 'rule' },
  { action: 'Case approved', actor: 'Analyst', entity: 'case' },
  { action: 'Rule threshold updated', actor: 'Admin', entity: 'rule' },
  { action: 'Bulk transaction review', actor: 'Automated Scanner', entity: 'transaction' },
  { action: 'Model retrained', actor: 'ML Pipeline', entity: 'model' },
  { action: 'User login', actor: 'System', entity: 'user' }
];

for (let i = 0; i < 100; i++) {
  const a = randomChoice(auditActions);
  const entityId = randomUUID();
  insertAudit.run(
    randomUUID(),
    now - randomInt(0, 30 * 24 * 60 * 60 * 1000),
    a.action,
    a.actor,
    a.entity,
    entityId,
    JSON.stringify({ detail: `Automated ${a.action.toLowerCase()}` }),
    `192.168.1.${randomInt(1, 254)}`,
    'Mozilla/5.0 (PolicyGuard AI Client)'
  );
}

console.log('Seeded 100 audit log entries');

const insertReport = db.prepare(`
  INSERT OR IGNORE INTO reports (id, report_id, type, title, status, generated_by, content, filters)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const reportTypes = ['AML Summary', 'Threat Report', 'Transaction Report', 'Compliance Report', 'SAR Report', 'AI Risk Report'];

for (let i = 0; i < 12; i++) {
  const id = randomUUID();
  const reportId = `RPT-${new Date(now - randomInt(0, 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0].replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`;
  const type = randomChoice(reportTypes);
  const status = randomChoice(['draft', 'generated', 'archived']);
  const generatedBy = randomChoice(users.filter(u => u.role !== 'admin')).id;
  const content = JSON.stringify({ summary: `${type} generated for period ending ${new Date().toLocaleDateString()}`, threats_reviewed: randomInt(5, 50), sars_filed: randomInt(0, 10) });
  const filters = JSON.stringify({ date_range: '30d', severity: 'all', status: 'all' });
  
  insertReport.run(id, reportId, type, `${type} - ${new Date().toLocaleDateString()}`, status, generatedBy, content, filters);
}

console.log('Seeded 12 reports');

const insertScanJob = db.prepare(`
  INSERT OR IGNORE INTO scan_jobs (id, job_id, status, progress, started_at, completed_at, tables_scanned, violations_found, error_message)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const tables = ['transactions', 'accounts', 'beneficiaries', 'customers', 'watchlists'];
for (let i = 0; i < 5; i++) {
  const id = randomUUID();
  const jobId = `SCAN-${new Date(now - randomInt(0, 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0].replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`;
  const status = i === 4 ? 'running' : 'completed';
  const progress = status === 'running' ? 67 : 100;
  const startedAt = now - randomInt(1, 7) * 24 * 60 * 60 * 1000;
  const completedAt = status === 'completed' ? startedAt + randomInt(300000, 1800000) : null;
  const tablesScanned = JSON.stringify(tables.slice(0, randomInt(3, 5)));
  const violations = randomInt(5, 25);
  const error = null;
  
  insertScanJob.run(id, jobId, status, progress, startedAt, completedAt, tablesScanned, violations, error);
}

console.log('Seeded 5 scan jobs');

const stats = db.prepare(`
  SELECT 
    (SELECT COUNT(*) FROM transactions) as total_txns,
    (SELECT COUNT(*) FROM transactions WHERE is_laundering = 1) as flagged_txns,
    (SELECT COUNT(*) FROM threats) as total_threats,
    (SELECT COUNT(*) FROM threats WHERE severity = 'critical') as critical_threats,
    (SELECT COUNT(*) FROM threats WHERE status = 'open') as open_threats,
    (SELECT COUNT(*) FROM cases) as total_cases,
    (SELECT COUNT(*) FROM accounts) as total_accounts,
    (SELECT COUNT(*) FROM rules WHERE is_active = 1) as active_rules
`).get();

console.log('\nDatabase Summary:', stats);
console.log('\nSeeding complete!');