import express from 'express';
import { z } from 'zod';
import db from '../db/init.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

const caseQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['new', 'investigating', 'escalated', 'awaiting_review', 'resolved', 'false_positive']).optional(),
  analyst_id: z.string().uuid().optional(),
  search: z.string().optional(),
  date_from: z.coerce.number().optional(),
  date_to: z.coerce.number().optional(),
  sort: z.enum(['created_at', 'updated_at', 'risk_score', 'case_id']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc')
});

router.get('/', (req, res, next) => {
  try {
    const query = caseQuerySchema.parse(req.query);
    const offset = (query.page - 1) * query.limit;
    
    let where = ['1=1'];
    const params = [];
    
    if (query.status) {
      where.push('c.status = ?');
      params.push(query.status);
    }
    
    if (query.analyst_id) {
      where.push('c.analyst_id = ?');
      params.push(query.analyst_id);
    }
    
    if (query.search) {
      where.push('(c.case_id LIKE ? OR c.notes LIKE ?)');
      const s = `%${query.search}%`;
      params.push(s, s);
    }
    
    if (query.date_from) {
      where.push('c.created_at >= ?');
      params.push(query.date_from);
    }
    
    if (query.date_to) {
      where.push('c.created_at <= ?');
      params.push(query.date_to);
    }
    
    const whereClause = where.join(' AND ');
    
    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM cases c WHERE ${whereClause}`);
    const { total } = countStmt.get(...params);
    
    const dataStmt = db.prepare(`
      SELECT c.*, u.name as analyst_name, u.email as analyst_email
      FROM cases c
      LEFT JOIN users u ON c.analyst_id = u.id
      WHERE ${whereClause}
      ORDER BY c.${query.sort} ${query.order.toUpperCase()}
      LIMIT ? OFFSET ?
    `);
    const cases = dataStmt.all(...params, query.limit, offset);
    
    for (const c of cases) {
      c.threat_list = c.threat_ids.split(',').filter(Boolean);
      c.threat_count = c.threat_list.length;
    }
    
    res.json({
      data: cases,
      pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) }
    });
  } catch (e) {
    next(e);
  }
});

router.get('/stats', (req, res, next) => {
  try {
    const byStatus = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM cases
      GROUP BY status
    `).all();
    
    const byAnalyst = db.prepare(`
      SELECT u.name, COUNT(*) as count, AVG(c.risk_score) as avg_risk
      FROM cases c
      LEFT JOIN users u ON c.analyst_id = u.id
      GROUP BY u.id, u.name
    `).all();
    
    const trend = db.prepare(`
      SELECT date(created_at/1000, 'unixepoch') as day, COUNT(*) as count
      FROM cases
      WHERE created_at > ?
      GROUP BY day
      ORDER BY day
    `).all(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    res.json({ byStatus, byAnalyst, trend });
  } catch (e) {
    next(e);
  }
});

router.get('/:caseId', (req, res, next) => {
  try {
    const c = db.prepare(`
      SELECT c.*, u.name as analyst_name, u.email as analyst_email
      FROM cases c
      LEFT JOIN users u ON c.analyst_id = u.id
      WHERE c.case_id = ?
    `).get(req.params.caseId);
    
    if (!c) return res.status(404).json({ error: 'Case not found' });
    
    const threatIds = c.threat_ids.split(',').filter(Boolean);
    let threats = [];
    if (threatIds.length > 0) {
      const placeholders = threatIds.map(() => '?').join(',');
      threats = db.prepare(`
        SELECT th.threat_id, th.severity, th.status, th.confidence, th.detected_at,
               r.rule_id, r.category, t.txn_id, t.amount
        FROM threats th
        JOIN rules r ON th.rule_id = r.rule_id
        JOIN transactions t ON th.transaction_id = t.id
        WHERE th.threat_id IN (${placeholders})
        ORDER BY th.detected_at DESC
      `).all(...threatIds);
    }
    
    res.json({ ...c, threats });
  } catch (e) {
    next(e);
  }
});

router.post('/', requireRole('analyst', 'senior_analyst', 'compliance_lead', 'admin'), (req, res, next) => {
  try {
    const schema = z.object({
      threat_ids: z.array(z.string()).min(1),
      analyst_id: z.string().uuid().optional(),
      notes: z.string().optional(),
      risk_score: z.number().int().min(0).max(100).default(50)
    });
    
    const data = schema.parse(req.body);
    const id = crypto.randomUUID();
    const caseId = `CASE-${String(Date.now()).slice(-4)}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
    const analystId = data.analyst_id || req.user.id;
    
    db.prepare(`
      INSERT INTO cases (id, case_id, threat_ids, status, analyst_id, risk_score, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, caseId, data.threat_ids.join(','), 'new', analystId, data.risk_score, data.notes || '');
    
    const c = db.prepare('SELECT * FROM cases WHERE id = ?').get(id);
    res.status(201).json(c);
  } catch (e) {
    next(e);
  }
});

router.patch('/:caseId', (req, res, next) => {
  try {
    const schema = z.object({
      status: z.enum(['new', 'investigating', 'escalated', 'awaiting_review', 'resolved', 'false_positive']).optional(),
      analyst_id: z.string().uuid().nullable().optional(),
      risk_score: z.number().int().min(0).max(100).optional(),
      notes: z.string().optional()
    });
    
    const data = schema.parse(req.body);
    const c = db.prepare('SELECT * FROM cases WHERE case_id = ?').get(req.params.caseId);
    
    if (!c) return res.status(404).json({ error: 'Case not found' });
    
    const updates = [];
    const params = [];
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }
    
    if (data.status === 'resolved' && c.status !== 'resolved') {
      updates.push('resolved_at = ?');
      params.push(Date.now());
    }
    
    updates.push('updated_at = ?');
    params.push(Date.now());
    
    if (updates.length > 0) {
      params.push(c.id);
      db.prepare(`UPDATE cases SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }
    
    const updated = db.prepare('SELECT * FROM cases WHERE case_id = ?').get(req.params.caseId);
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.post('/:caseId/add-threats', (req, res, next) => {
  try {
    const schema = z.object({ threat_ids: z.array(z.string()).min(1) });
    const { threat_ids } = schema.parse(req.body);
    
    const c = db.prepare('SELECT * FROM cases WHERE case_id = ?').get(req.params.caseId);
    if (!c) return res.status(404).json({ error: 'Case not found' });
    
    const existing = c.threat_ids.split(',').filter(Boolean);
    const combined = [...new Set([...existing, ...threat_ids])].join(',');
    
    db.prepare('UPDATE cases SET threat_ids = ?, updated_at = ? WHERE id = ?')
      .run(combined, Date.now(), c.id);
    
    const updated = db.prepare('SELECT * FROM cases WHERE case_id = ?').get(req.params.caseId);
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

export default router;