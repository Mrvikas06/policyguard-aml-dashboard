import express from 'express';
import { z } from 'zod';
import db from '../db/init.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

const threatQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  status: z.enum(['open', 'investigating', 'resolved', 'false_positive']).optional(),
  rule_id: z.string().optional(),
  search: z.string().optional(),
  date_from: z.coerce.number().optional(),
  date_to: z.coerce.number().optional(),
  sort: z.enum(['detected_at', 'severity', 'confidence', 'threat_id']).default('detected_at'),
  order: z.enum(['asc', 'desc']).default('desc')
});

router.get('/', (req, res, next) => {
  try {
    const query = threatQuerySchema.parse(req.query);
    const offset = (query.page - 1) * query.limit;
    
    let where = ['1=1'];
    const params = [];
    
    if (query.severity) {
      where.push('th.severity = ?');
      params.push(query.severity);
    }
    
    if (query.status) {
      where.push('th.status = ?');
      params.push(query.status);
    }
    
    if (query.rule_id) {
      where.push('th.rule_id = ?');
      params.push(query.rule_id);
    }
    
    if (query.search) {
      where.push('(th.threat_id LIKE ? OR r.rule_id LIKE ? OR t.txn_id LIKE ? OR a1.account_number LIKE ? OR a2.account_number LIKE ?)');
      const s = `%${query.search}%`;
      params.push(s, s, s, s, s);
    }
    
    if (query.date_from) {
      where.push('th.detected_at >= ?');
      params.push(query.date_from);
    }
    
    if (query.date_to) {
      where.push('th.detected_at <= ?');
      params.push(query.date_to);
    }
    
    const whereClause = where.join(' AND ');
    
    const countStmt = db.prepare(`
      SELECT COUNT(*) as total
      FROM threats th
      JOIN rules r ON th.rule_id = r.rule_id
      JOIN transactions t ON th.transaction_id = t.id
      JOIN accounts a1 ON t.from_account_id = a1.id
      JOIN accounts a2 ON t.to_account_id = a2.id
      WHERE ${whereClause}
    `);
    const { total } = countStmt.get(...params);
    
    const dataStmt = db.prepare(`
      SELECT 
        th.threat_id, th.severity, th.status, th.confidence, th.evidence, th.remediation,
        th.detected_at, th.resolved_at, th.assigned_to,
        r.rule_id, r.category as rule_category, r.description as rule_description, r.basis as rule_basis,
        t.txn_id, t.amount, t.currency, t.payment_format, t.timestamp,
        a1.account_number as from_account, a1.country as from_country,
        a2.account_number as to_account, a2.country as to_country,
        u.name as analyst_name
      FROM threats th
      JOIN rules r ON th.rule_id = r.rule_id
      JOIN transactions t ON th.transaction_id = t.id
      JOIN accounts a1 ON t.from_account_id = a1.id
      JOIN accounts a2 ON t.to_account_id = a2.id
      LEFT JOIN users u ON th.assigned_to = u.id
      WHERE ${whereClause}
      ORDER BY th.${query.sort} ${query.order.toUpperCase()}
      LIMIT ? OFFSET ?
    `);
    const threats = dataStmt.all(...params, query.limit, offset);
    
    res.json({
      data: threats,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit)
      }
    });
  } catch (e) {
    next(e);
  }
});

router.get('/stats', (req, res, next) => {
  try {
    const bySeverity = db.prepare(`
      SELECT severity, COUNT(*) as count
      FROM threats
      GROUP BY severity
    `).all();
    
    const byStatus = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM threats
      GROUP BY status
    `).all();
    
    const byRule = db.prepare(`
      SELECT r.rule_id, r.category, COUNT(*) as count
      FROM threats th
      JOIN rules r ON th.rule_id = r.rule_id
      GROUP BY r.rule_id, r.category
      ORDER BY count DESC
      LIMIT 10
    `).all();
    
    const trend = db.prepare(`
      SELECT 
        date(detected_at/1000, 'unixepoch') as day,
        COUNT(*) as count,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical
      FROM threats
      WHERE detected_at > ?
      GROUP BY day
      ORDER BY day
    `).all(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const avgConfidence = db.prepare('SELECT AVG(confidence) as avg FROM threats').get();
    
    res.json({ bySeverity, byStatus, byRule, trend, avgConfidence: avgConfidence.avg });
  } catch (e) {
    next(e);
  }
});

router.get('/:threatId', (req, res, next) => {
  try {
    const threat = db.prepare(`
      SELECT 
        th.*, r.rule_id, r.category as rule_category, r.description as rule_description, r.basis as rule_basis,
        t.txn_id, t.amount, t.currency, t.payment_format, t.timestamp, t.is_laundering,
        a1.account_number as from_account, a1.account_type as from_type, a1.balance as from_balance, a1.country as from_country, a1.risk_score as from_risk, a1.open_date as from_open_date,
        a2.account_number as to_account, a2.account_type as to_type, a2.balance as to_balance, a2.country as to_country, a2.risk_score as to_risk, a2.open_date as to_open_date,
        u.name as analyst_name, u.email as analyst_email
      FROM threats th
      JOIN rules r ON th.rule_id = r.rule_id
      JOIN transactions t ON th.transaction_id = t.id
      JOIN accounts a1 ON t.from_account_id = a1.id
      JOIN accounts a2 ON t.to_account_id = a2.id
      LEFT JOIN users u ON th.assigned_to = u.id
      WHERE th.threat_id = ?
    `).get(req.params.threatId);
    
    if (!threat) {
      return res.status(404).json({ error: 'Threat not found' });
    }
    
    const relatedTxns = db.prepare(`
      SELECT t.txn_id, t.amount, t.timestamp, t.payment_format, t.is_laundering,
             a1.account_number as from_account, a2.account_number as to_account
      FROM transactions t
      JOIN accounts a1 ON t.from_account_id = a1.id
      JOIN accounts a2 ON t.to_account_id = a2.id
      WHERE (t.from_account_id = ? OR t.to_account_id = ? OR t.from_account_id = ? OR t.to_account_id = ?)
        AND t.id != ?
      ORDER BY ABS(t.timestamp - ?) ASC
      LIMIT 10
    `).all(threat.from_account_id || threat.id, threat.from_account_id || threat.id, threat.to_account_id || threat.id, threat.to_account_id || threat.id, threat.transaction_id, threat.timestamp);
    
    res.json({ ...threat, related_transactions: relatedTxns });
  } catch (e) {
    next(e);
  }
});

router.patch('/:threatId', (req, res, next) => {
  try {
    const schema = z.object({
      status: z.enum(['open', 'investigating', 'resolved', 'false_positive']).optional(),
      assigned_to: z.string().uuid().nullable().optional(),
      confidence: z.number().min(0).max(1).optional(),
      remediation: z.string().optional()
    });
    
    const data = schema.parse(req.body);
    const threat = db.prepare('SELECT * FROM threats WHERE threat_id = ?').get(req.params.threatId);
    
    if (!threat) {
      return res.status(404).json({ error: 'Threat not found' });
    }
    
    const updates = [];
    const params = [];
    
    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
      if (data.status === 'resolved' && threat.status !== 'resolved') {
        updates.push('resolved_at = ?');
        params.push(Date.now());
      }
    }
    
    if (data.assigned_to !== undefined) {
      updates.push('assigned_to = ?');
      params.push(data.assigned_to);
    }
    
    if (data.confidence !== undefined) {
      updates.push('confidence = ?');
      params.push(data.confidence);
    }
    
    if (data.remediation !== undefined) {
      updates.push('remediation = ?');
      params.push(data.remediation);
    }
    
    if (updates.length > 0) {
      params.push(threat.id);
      db.prepare(`UPDATE threats SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }
    
    const updated = db.prepare('SELECT * FROM threats WHERE threat_id = ?').get(req.params.threatId);
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.post('/bulk-action', requireRole('analyst', 'senior_analyst', 'compliance_lead', 'admin'), (req, res, next) => {
  try {
    const schema = z.object({
      threat_ids: z.array(z.string()).min(1),
      action: z.enum(['assign', 'resolve', 'escalate', 'mark_false_positive']),
      assignee_id: z.string().uuid().optional()
    });
    
    const { threat_ids, action, assignee_id } = schema.parse(req.body);
    
    const placeholders = threat_ids.map(() => '?').join(',');
    let updates = [];
    let params = [...threat_ids];
    
    switch (action) {
      case 'assign':
        if (!assignee_id) return res.status(400).json({ error: 'Assignee required' });
        updates.push('assigned_to = ?', 'status = ?');
        params.push(assignee_id, 'investigating');
        break;
      case 'resolve':
        updates.push('status = ?', 'resolved_at = ?');
        params.push('resolved', Date.now());
        break;
      case 'escalate':
        updates.push('status = ?');
        params.push('investigating');
        break;
      case 'mark_false_positive':
        updates.push('status = ?');
        params.push('false_positive');
        break;
    }
    
    db.prepare(`UPDATE threats SET ${updates.join(', ')} WHERE threat_id IN (${placeholders})`).run(...params);
    
    res.json({ updated: threat_ids.length });
  } catch (e) {
    next(e);
  }
});

export default router;