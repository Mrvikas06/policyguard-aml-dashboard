import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '..', '..', 'data', 'policyguard.db');

const db = new Database(dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  PRAGMA synchronous = NORMAL;
  PRAGMA cache_size = 10000;
  PRAGMA temp_store = MEMORY;
`);

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'analyst',
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  last_login_at INTEGER
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  account_number TEXT UNIQUE NOT NULL,
  account_type TEXT NOT NULL,
  open_date INTEGER NOT NULL,
  balance REAL NOT NULL DEFAULT 0,
  country TEXT NOT NULL,
  risk_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  txn_id TEXT UNIQUE NOT NULL,
  from_account_id TEXT NOT NULL,
  to_account_id TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_format TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  is_laundering INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  FOREIGN KEY (from_account_id) REFERENCES accounts(id),
  FOREIGN KEY (to_account_id) REFERENCES accounts(id)
);

CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_transactions_from ON transactions(from_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to ON transactions(to_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_laundering ON transactions(is_laundering);

CREATE TABLE IF NOT EXISTS threats (
  id TEXT PRIMARY KEY,
  threat_id TEXT UNIQUE NOT NULL,
  rule_id TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  confidence REAL NOT NULL,
  evidence TEXT NOT NULL,
  remediation TEXT,
  detected_at INTEGER NOT NULL,
  resolved_at INTEGER,
  assigned_to TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

CREATE INDEX IF NOT EXISTS idx_threats_severity ON threats(severity);
CREATE INDEX IF NOT EXISTS idx_threats_status ON threats(status);
CREATE INDEX IF NOT EXISTS idx_threats_detected ON threats(detected_at);

CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,
  rule_id TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL,
  basis TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  trigger_count INTEGER NOT NULL DEFAULT 0,
  last_triggered INTEGER,
  precision REAL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  case_id TEXT UNIQUE NOT NULL,
  threat_ids TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  analyst_id TEXT,
  risk_score INTEGER NOT NULL,
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  resolved_at INTEGER,
  FOREIGN KEY (analyst_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_analyst ON cases(analyst_id);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  timestamp INTEGER NOT NULL,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  report_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  generated_by TEXT,
  content TEXT,
  filters TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  completed_at INTEGER,
  FOREIGN KEY (generated_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS scan_jobs (
  id TEXT PRIMARY KEY,
  job_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  progress INTEGER NOT NULL DEFAULT 0,
  started_at INTEGER,
  completed_at INTEGER,
  tables_scanned TEXT,
  violations_found INTEGER DEFAULT 0,
  error_message TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);
`;

db.exec(schema);

const views = `
CREATE VIEW IF NOT EXISTS v_transaction_summary AS
SELECT 
  t.txn_id,
  t.amount,
  t.currency,
  t.payment_format,
  t.timestamp,
  t.is_laundering,
  a1.account_number as from_account,
  a1.country as from_country,
  a2.account_number as to_account,
  a2.country as to_country
FROM transactions t
JOIN accounts a1 ON t.from_account_id = a1.id
JOIN accounts a2 ON t.to_account_id = a2.id;

CREATE VIEW IF NOT EXISTS v_threat_detail AS
SELECT 
  th.threat_id,
  th.severity,
  th.status,
  th.confidence,
  th.evidence,
  th.remediation,
  th.detected_at,
  th.resolved_at,
  r.rule_id,
  r.category as rule_category,
  r.basis as rule_basis,
  t.txn_id,
  t.amount,
  t.payment_format,
  a1.account_number as from_account,
  a2.account_number as to_account
FROM threats th
JOIN rules r ON th.rule_id = r.rule_id
JOIN transactions t ON th.transaction_id = t.id
JOIN accounts a1 ON t.from_account_id = a1.id
JOIN accounts a2 ON t.to_account_id = a2.id;

CREATE VIEW IF NOT EXISTS v_network_edges AS
SELECT 
  t.from_account_id as source_id,
  t.to_account_id as target_id,
  t.txn_id,
  t.amount,
  t.timestamp,
  t.is_laundering,
  a1.account_number as source_account,
  a1.risk_score as source_risk,
  a2.account_number as target_account,
  a2.risk_score as target_risk
FROM transactions t
JOIN accounts a1 ON t.from_account_id = a1.id
JOIN accounts a2 ON t.to_account_id = a2.id
WHERE t.is_laundering = 1 OR t.amount > 10000;
`;

db.exec(views);

console.log('Database schema initialized successfully');
console.log('Database path:', dbPath);

export { db };
export default db;