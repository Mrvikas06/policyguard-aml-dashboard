import express from 'express';
import db from '../db/init.js';

const router = express.Router();

router.get('/graph', (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 500, 2000);
    const minAmount = parseFloat(req.query.min_amount) || 0;
    const onlyFlagged = req.query.flagged === 'true';
    
    let where = ['1=1'];
    const params = [];
    
    if (minAmount > 0) {
      where.push('t.amount >= ?');
      params.push(minAmount);
    }
    
    if (onlyFlagged) {
      where.push('t.is_laundering = 1');
    }
    
    const whereClause = where.join(' AND ');
    
    const edges = db.prepare(`
      SELECT 
        t.txn_id, t.amount, t.timestamp, t.is_laundering, t.payment_format,
        a1.id as source_id, a1.account_number as source_account, a1.risk_score as source_risk, a1.country as source_country,
        a2.id as target_id, a2.account_number as target_account, a2.risk_score as target_risk, a2.country as target_country
      FROM transactions t
      JOIN accounts a1 ON t.from_account_id = a1.id
      JOIN accounts a2 ON t.to_account_id = a2.id
      WHERE ${whereClause}
      ORDER BY t.amount DESC
      LIMIT ?
    `).all(...params, limit);
    
    const nodeMap = new Map();
    for (const e of edges) {
      if (!nodeMap.has(e.source_id)) {
        nodeMap.set(e.source_id, { id: e.source_id, account: e.source_account, risk: e.source_risk, country: e.source_country, type: 'account' });
      }
      if (!nodeMap.has(e.target_id)) {
        nodeMap.set(e.target_id, { id: e.target_id, account: e.target_account, risk: e.target_risk, country: e.target_country, type: 'account' });
      }
    }
    
    const nodes = Array.from(nodeMap.values()).map(n => ({
      id: n.id,
      label: n.account,
      risk: n.risk,
      country: n.country,
      type: n.type
    }));
    
    const links = edges.map(e => ({
      source: e.source_id,
      target: e.target_id,
      txn_id: e.txn_id,
      amount: e.amount,
      timestamp: e.timestamp,
      flagged: e.is_laundering === 1,
      format: e.payment_format
    }));
    
    res.json({ nodes, links, stats: { nodeCount: nodes.length, linkCount: links.length } });
  } catch (e) {
    next(e);
  }
});

router.get('/high-risk-pairs', (req, res, next) => {
  try {
    const pairs = db.prepare(`
      SELECT 
        a1.account_number as from_account,
        a2.account_number as to_account,
        COUNT(*) as txn_count,
        SUM(t.amount) as total_amount,
        AVG(t.amount) as avg_amount,
        MAX(t.amount) as max_amount,
        SUM(t.is_laundering) as flagged_count,
        MAX(t.timestamp) as last_activity
      FROM transactions t
      JOIN accounts a1 ON t.from_account_id = a1.id
      JOIN accounts a2 ON t.to_account_id = a2.id
      WHERE t.timestamp > ?
      GROUP BY a1.id, a2.id
      HAVING txn_count >= 3 OR total_amount > 50000 OR flagged_count > 0
      ORDER BY flagged_count DESC, total_amount DESC
      LIMIT 50
    `).all(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const enriched = pairs.map(p => ({
      ...p,
      risk_level: p.flagged_count > 0 ? 'CRITICAL' : p.total_amount > 100000 ? 'HIGH' : p.txn_count > 10 ? 'MEDIUM' : 'LOW',
      velocity: p.txn_count,
      severity: p.flagged_count > 0 ? 'critical' : p.total_amount > 100000 ? 'high' : 'medium'
    }));
    
    res.json(enriched);
  } catch (e) {
    next(e);
  }
});

router.get('/account/:accountId', (req, res, next) => {
  try {
    const account = db.prepare('SELECT * FROM accounts WHERE id = ? OR account_number = ?').get(req.params.accountId, req.params.accountId);
    if (!account) return res.status(404).json({ error: 'Account not found' });
    
    const outgoing = db.prepare(`
      SELECT t.txn_id, t.amount, t.timestamp, t.payment_format, t.is_laundering,
             a2.account_number as to_account, a2.risk_score as to_risk, a2.country as to_country
      FROM transactions t
      JOIN accounts a2 ON t.to_account_id = a2.id
      WHERE t.from_account_id = ?
      ORDER BY t.timestamp DESC
      LIMIT 50
    `).all(account.id);
    
    const incoming = db.prepare(`
      SELECT t.txn_id, t.amount, t.timestamp, t.payment_format, t.is_laundering,
             a1.account_number as from_account, a1.risk_score as from_risk, a1.country as from_country
      FROM transactions t
      JOIN accounts a1 ON t.from_account_id = a1.id
      WHERE t.to_account_id = ?
      ORDER BY t.timestamp DESC
      LIMIT 50
    `).all(account.id);
    
    const threats = db.prepare(`
      SELECT th.threat_id, th.severity, th.status, th.detected_at, r.rule_id, t.txn_id, t.amount
      FROM threats th
      JOIN rules r ON th.rule_id = r.rule_id
      JOIN transactions t ON th.transaction_id = t.id
      WHERE t.from_account_id = ? OR t.to_account_id = ?
      ORDER BY th.detected_at DESC
    `).all(account.id, account.id);
    
    res.json({ account, outgoing, incoming, threats, risk_score: account.risk_score });
  } catch (e) {
    next(e);
  }
});

router.get('/path/:fromId/:toId', (req, res, next) => {
  try {
    const maxDepth = parseInt(req.query.depth) || 3;
    
    const paths = findPaths(db, req.params.fromId, req.params.toId, maxDepth);
    
    res.json({ paths, from: req.params.fromId, to: req.params.toId, maxDepth });
  } catch (e) {
    next(e);
  }
});

function findPaths(db, fromId, toId, maxDepth) {
  const fromAccount = db.prepare('SELECT id FROM accounts WHERE id = ? OR account_number = ?').get(fromId, fromId);
  const toAccount = db.prepare('SELECT id FROM accounts WHERE id = ? OR account_number = ?').get(toId, toId);
  
  if (!fromAccount || !toAccount) return [];
  
  const queue = [[fromAccount.id, []]];
  const visited = new Set([fromAccount.id]);
  const paths = [];
  
  while (queue.length > 0 && paths.length < 10) {
    const [currentId, path] = queue.shift();
    
    if (path.length >= maxDepth) continue;
    
    const edges = db.prepare(`
      SELECT t.to_account_id, t.txn_id, t.amount, t.timestamp, t.is_laundering
      FROM transactions t
      WHERE t.from_account_id = ?
      ORDER BY t.amount DESC
      LIMIT 10
    `).all(currentId);
    
    for (const edge of edges) {
      const newPath = [...path, { from: currentId, to: edge.to_account_id, ...edge }];
      
      if (edge.to_account_id === toAccount.id) {
        paths.push(newPath);
      } else if (!visited.has(edge.to_account_id) && path.length < maxDepth - 1) {
        visited.add(edge.to_account_id);
        queue.push([edge.to_account_id, newPath]);
      }
    }
  }
  
  return paths;
}

export default router;
