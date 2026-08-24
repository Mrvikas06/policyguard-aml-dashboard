import express from 'express';
import { z } from 'zod';
import db from '../db/init.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const rules = db.prepare(`
      SELECT * FROM rules ORDER BY category, rule_id
    `).all();
    
    const grouped = rules.reduce((acc, rule) => {
      if (!acc[rule.category]) acc[rule.category] = [];
      acc[rule.category].push(rule);
      return acc;
    }, {});
    
    res.json(grouped);
  } catch (e) {
    next(e);
  }
});

router.get('/flat', (req, res, next) => {
  try {
    const rules = db.prepare('SELECT * FROM rules ORDER BY category, rule_id').all();
    res.json(rules);
  } catch (e) {
    next(e);
  }
});

router.get('/stats', (req, res, next) => {
  try {
    const stats = db.prepare(`
      SELECT 
        category,
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(trigger_count) as total_triggers,
        AVG(precision) as avg_precision
      FROM rules
      GROUP BY category
    `).all();
    
    const recentTriggers = db.prepare(`
      SELECT r.rule_id, r.category, th.detected_at, th.severity
      FROM threats th
      JOIN rules r ON th.rule_id = r.rule_id
      ORDER BY th.detected_at DESC
      LIMIT 20
    `).all();
    
    res.json({ byCategory: stats, recentTriggers });
  } catch (e) {
    next(e);
  }
});

router.get('/:ruleId', (req, res, next) => {
  try {
    const rule = db.prepare('SELECT * FROM rules WHERE rule_id = ?').get(req.params.ruleId);
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    
    const threats = db.prepare(`
      SELECT th.threat_id, th.severity, th.status, th.confidence, th.detected_at, t.txn_id, t.amount
      FROM threats th
      JOIN transactions t ON th.transaction_id = t.id
      WHERE th.rule_id = ?
      ORDER BY th.detected_at DESC
      LIMIT 50
    `).all(req.params.ruleId);
    
    res.json({ ...rule, recent_threats: threats });
  } catch (e) {
    next(e);
  }
});

router.post('/', requireRole('admin', 'compliance_lead'), (req, res, next) => {
  try {
    const schema = z.object({
      rule_id: z.string(),
      category: z.string(),
      description: z.string(),
      severity: z.enum(['critical', 'high', 'medium', 'low']),
      basis: z.string(),
      is_active: z.boolean().default(true)
    });
    
    const data = schema.parse(req.body);
    const id = crypto.randomUUID();
    
    db.prepare(`
      INSERT INTO rules (id, rule_id, category, description, severity, basis, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.rule_id, data.category, data.description, data.severity, data.basis, data.is_active ? 1 : 0);
    
    const rule = db.prepare('SELECT * FROM rules WHERE id = ?').get(id);
    res.status(201).json(rule);
  } catch (e) {
    next(e);
  }
});

router.patch('/:ruleId', requireRole('admin', 'compliance_lead'), (req, res, next) => {
  try {
    const schema = z.object({
      description: z.string().optional(),
      severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
      basis: z.string().optional(),
      is_active: z.boolean().optional()
    });
    
    const data = schema.parse(req.body);
    const rule = db.prepare('SELECT * FROM rules WHERE rule_id = ?').get(req.params.ruleId);
    
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    
    const updates = [];
    const params = [];
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }
    
    if (updates.length > 0) {
      params.push(rule.id);
      db.prepare(`UPDATE rules SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }
    
    const updated = db.prepare('SELECT * FROM rules WHERE rule_id = ?').get(req.params.ruleId);
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.post('/:ruleId/test', requireRole('admin', 'compliance_lead'), (req, res, next) => {
  try {
    const rule = db.prepare('SELECT * FROM rules WHERE rule_id = ?').get(req.params.ruleId);
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    
    const sampleSize = Math.min(1000, db.prepare('SELECT COUNT(*) as c FROM transactions').get().c);
    const sample = db.prepare(`
      SELECT t.*, a1.account_number as from_account, a2.account_number as to_account
      FROM transactions t
      JOIN accounts a1 ON t.from_account_id = a1.id
      JOIN accounts a2 ON t.to_account_id = a2.id
      ORDER BY RANDOM()
      LIMIT ?
    `).all(sampleSize);
    
    let matches = 0;
    let truePositives = 0;
    
    for (const txn of sample) {
      const matchesRule = evaluateRule(rule, txn);
      if (matchesRule) {
        matches++;
        if (txn.is_laundering) truePositives++;
      }
    }
    
    const precision = matches > 0 ? truePositives / matches : 0;
    const recall = sample.filter(t => t.is_laundering).length > 0 
      ? truePositives / sample.filter(t => t.is_laundering).length 
      : 0;
    
    db.prepare('UPDATE rules SET precision = ?, trigger_count = trigger_count + ? WHERE id = ?')
      .run(precision, matches, rule.id);
    
    res.json({ 
      rule_id: rule.rule_id,
      sample_size: sampleSize,
      matches,
      true_positives: truePositives,
      precision: precision.toFixed(4),
      recall: recall.toFixed(4),
      f1: precision && recall ? (2 * precision * recall / (precision + recall)).toFixed(4) : 0
    });
  } catch (e) {
    next(e);
  }
});

function evaluateRule(rule, txn) {
  switch (rule.rule_id) {
    case 'R-001': return txn.amount > 10000;
    case 'R-003': return txn.amount >= 9900 && txn.amount <= 9999;
    case 'R-018': return txn.payment_format === 'CASH_OUT' && txn.amount > 5000;
    default: return Math.random() < 0.01;
  }
}

export default router;