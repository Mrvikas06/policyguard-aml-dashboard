import express from 'express';
import { z } from 'zod';
import db from '../db/init.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

const transactionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  from_account: z.string().optional(),
  to_account: z.string().optional(),
  min_amount: z.coerce.number().optional(),
  max_amount: z.coerce.number().optional(),
  payment_format: z.string().optional(),
  is_laundering: z.coerce.boolean().optional(),
  country: z.string().optional(),
  date_from: z.coerce.number().optional(),
  date_to: z.coerce.number().optional(),
  sort: z.enum(['timestamp', 'amount', 'txn_id']).default('timestamp'),
  order: z.enum(['asc', 'desc']).default('desc')
});

router.get('/', (req, res, next) => {
  try {
    const query = transactionQuerySchema.parse(req.query);
    const offset = (query.page - 1) * query.limit;
    
    let where = ['1=1'];
    const params = [];
    
    if (query.search) {
      where.push('(t.txn_id LIKE ? OR a1.account_number LIKE ? OR a2.account_number LIKE ?)');
      const s = `%${query.search}%`;
      params.push(s, s, s);
    }
    
    if (query.from_account) {
      where.push('a1.account_number = ?');
      params.push(query.from_account);
    }
    
    if (query.to_account) {
      where.push('a2.account_number = ?');
      params.push(query.to_account);
    }
    
    if (query.min_amount !== undefined) {
      where.push('t.amount >= ?');
      params.push(query.min_amount);
    }
    
    if (query.max_amount !== undefined) {
      where.push('t.amount <= ?');
      params.push(query.max_amount);
    }
    
    if (query.payment_format) {
      where.push('t.payment_format = ?');
      params.push(query.payment_format);
    }
    
    if (query.is_laundering !== undefined) {
      where.push('t.is_laundering = ?');
      params.push(query.is_laundering ? 1 : 0);
    }
    
    if (query.country) {
      where.push('(a1.country = ? OR a2.country = ?)');
      params.push(query.country, query.country);
    }
    
    if (query.date_from) {
      where.push('t.timestamp >= ?');
      params.push(query.date_from);
    }
    
    if (query.date_to) {
      where.push('t.timestamp <= ?');
      params.push(query.date_to);
    }
    
    const whereClause = where.join(' AND ');
    
    const countStmt = db.prepare(`
      SELECT COUNT(*) as total
      FROM transactions t
      JOIN accounts a1 ON t.from_account_id = a1.id
      JOIN accounts a2 ON t.to_account_id = a2.id
      WHERE ${whereClause}
    `);
    const { total } = countStmt.get(...params);
    
    const dataStmt = db.prepare(`
      SELECT 
        t.txn_id, t.amount, t.currency, t.payment_format, t.timestamp, t.is_laundering,
        a1.account_number as from_account, a1.country as from_country, a1.risk_score as from_risk,
        a2.account_number as to_account, a2.country as to_country, a2.risk_score as to_risk
      FROM transactions t
      JOIN accounts a1 ON t.from_account_id = a1.id
      JOIN accounts a2 ON t.to_account_id = a2.id
      WHERE ${whereClause}
      ORDER BY t.${query.sort} ${query.order.toUpperCase()}
      LIMIT ? OFFSET ?
    `);
    const transactions = dataStmt.all(...params, query.limit, offset);
    
    res.json({
      data: transactions,
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
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_laundering = 1 THEN 1 ELSE 0 END) as flagged,
        SUM(amount) as total_volume,
        AVG(amount) as avg_amount,
        MAX(amount) as max_amount,
        COUNT(DISTINCT from_account_id) as unique_senders,
        COUNT(DISTINCT to_account_id) as unique_receivers
      FROM transactions
    `).get();
    
    const byFormat = db.prepare(`
      SELECT payment_format, COUNT(*) as count, SUM(amount) as volume
      FROM transactions
      GROUP BY payment_format
      ORDER BY count DESC
    `).all();
    
    const byCountry = db.prepare(`
      SELECT a.country, COUNT(*) as count, SUM(t.amount) as volume
      FROM transactions t
      JOIN accounts a ON t.from_account_id = a.id
      GROUP BY a.country
      ORDER BY count DESC
      LIMIT 10
    `).all();
    
    const hourlyVolume = db.prepare(`
      SELECT 
        strftime('%H', datetime(timestamp/1000, 'unixepoch')) as hour,
        COUNT(*) as count,
        SUM(amount) as volume
      FROM transactions
      WHERE timestamp > ?
      GROUP BY hour
      ORDER BY hour
    `).all(Date.now() - 24 * 60 * 60 * 1000);
    
    res.json({ summary: stats, byFormat, byCountry, hourlyVolume });
  } catch (e) {
    next(e);
  }
});

router.get('/:txnId', (req, res, next) => {
  try {
    const txn = db.prepare(`
      SELECT 
        t.*, 
        a1.account_number as from_account, a1.account_type as from_type, a1.balance as from_balance, a1.country as from_country, a1.risk_score as from_risk,
        a2.account_number as to_account, a2.account_type as to_type, a2.balance as to_balance, a2.country as to_country, a2.risk_score as to_risk
      FROM transactions t
      JOIN accounts a1 ON t.from_account_id = a1.id
      JOIN accounts a2 ON t.to_account_id = a2.id
      WHERE t.txn_id = ?
    `).get(req.params.txnId);
    
    if (!txn) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    const relatedThreats = db.prepare(`
      SELECT th.threat_id, th.severity, th.status, th.confidence, th.detected_at, r.rule_id, r.category
      FROM threats th
      JOIN rules r ON th.rule_id = r.rule_id
      WHERE th.transaction_id = t.id
    `).all(txn.id);
    
    res.json({ ...txn, threats: relatedThreats });
  } catch (e) {
    next(e);
  }
});

router.post('/', requireRole('admin', 'compliance_lead'), (req, res, next) => {
  try {
    const schema = z.object({
      txn_id: z.string(),
      from_account_id: z.string().uuid(),
      to_account_id: z.string().uuid(),
      amount: z.number().positive(),
      currency: z.string().default('USD'),
      payment_format: z.string(),
      timestamp: z.number(),
      is_laundering: z.number().int().min(0).max(1).default(0)
    });
    
    const data = schema.parse(req.body);
    const id = crypto.randomUUID();
    
    db.prepare(`
      INSERT INTO transactions (id, txn_id, from_account_id, to_account_id, amount, currency, payment_format, timestamp, is_laundering)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.txn_id, data.from_account_id, data.to_account_id, data.amount, data.currency, data.payment_format, data.timestamp, data.is_laundering);
    
    const txn = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    res.status(201).json(txn);
  } catch (e) {
    next(e);
  }
});

export default router;