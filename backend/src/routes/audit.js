import express from 'express';
import { z } from 'zod';
import db from '../db/init.js';

const router = express.Router();

const auditQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  actor: z.string().optional(),
  action: z.string().optional(),
  entity_type: z.string().optional(),
  date_from: z.coerce.number().optional(),
  date_to: z.coerce.number().optional(),
  sort: z.enum(['timestamp']).default('timestamp'),
  order: z.enum(['asc', 'desc']).default('desc')
});

router.get('/', (req, res, next) => {
  try {
    const query = auditQuerySchema.parse(req.query);
    const offset = (query.page - 1) * query.limit;
    
    let where = ['1=1'];
    const params = [];
    
    if (query.actor) {
      where.push('actor LIKE ?');
      params.push(`%${query.actor}%`);
    }
    
    if (query.action) {
      where.push('action LIKE ?');
      params.push(`%${query.action}%`);
    }
    
    if (query.entity_type) {
      where.push('entity_type = ?');
      params.push(query.entity_type);
    }
    
    if (query.date_from) {
      where.push('timestamp >= ?');
      params.push(query.date_from);
    }
    
    if (query.date_to) {
      where.push('timestamp <= ?');
      params.push(query.date_to);
    }
    
    const whereClause = where.join(' AND ');
    
    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM audit_log WHERE ${whereClause}`);
    const { total } = countStmt.get(...params);
    
    const dataStmt = db.prepare(`
      SELECT * FROM audit_log WHERE ${whereClause}
      ORDER BY timestamp ${query.order.toUpperCase()}
      LIMIT ? OFFSET ?
    `);
    const logs = dataStmt.all(...params, query.limit, offset);
    
    res.json({
      data: logs.map(l => ({ ...l, details: l.details ? JSON.parse(l.details) : {} })),
      pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) }
    });
  } catch (e) {
    next(e);
  }
});

router.get('/stats', (req, res, next) => {
  try {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    
    const byActor = db.prepare(`
      SELECT actor, COUNT(*) as count
      FROM audit_log
      WHERE timestamp > ?
      GROUP BY actor
      ORDER BY count DESC
    `).all(now - 30 * day);
    
    const byAction = db.prepare(`
      SELECT action, COUNT(*) as count
      FROM audit_log
      WHERE timestamp > ?
      GROUP BY action
      ORDER BY count DESC
      LIMIT 20
    `).all(now - 30 * day);
    
    const byEntity = db.prepare(`
      SELECT entity_type, COUNT(*) as count
      FROM audit_log
      WHERE timestamp > ? AND entity_type IS NOT NULL
      GROUP BY entity_type
      ORDER BY count DESC
    `).all(now - 30 * day);
    
    const timeline = db.prepare(`
      SELECT date(timestamp/1000, 'unixepoch') as day, COUNT(*) as count
      FROM audit_log
      WHERE timestamp > ?
      GROUP BY day
      ORDER BY day
    `).all(now - 30 * day);
    
    res.json({ byActor, byAction, byEntity, timeline });
  } catch (e) {
    next(e);
  }
});

export default router;
