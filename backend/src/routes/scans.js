import express from 'express';
import { z } from 'zod';
import db from '../db/init.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;
    const status = req.query.status;
    
    let where = ['1=1'];
    const params = [];
    
    if (status) { where.push('status = ?'); params.push(status); }
    
    const whereClause = where.join(' AND ');
    
    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM scan_jobs WHERE ${whereClause}`);
    const { total } = countStmt.get(...params);
    
    const dataStmt = db.prepare(`
      SELECT * FROM scan_jobs WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?
    `);
    const scans = dataStmt.all(...params, limit, offset);
    
    res.json({
      data: scans.map(s => ({ ...s, tables_scanned: JSON.parse(s.tables_scanned || '[]') })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (e) {
    next(e);
  }
});

router.get('/:jobId', (req, res, next) => {
  try {
    const scan = db.prepare('SELECT * FROM scan_jobs WHERE job_id = ?').get(req.params.jobId);
    if (!scan) return res.status(404).json({ error: 'Scan job not found' });
    
    res.json({ ...scan, tables_scanned: JSON.parse(scan.tables_scanned || '[]') });
  } catch (e) {
    next(e);
  }
});

router.post('/', requireRole('admin', 'compliance_lead'), (req, res, next) => {
  try {
    const schema = z.object({
      tables: z.array(z.string()).optional(),
      priority: z.enum(['low', 'normal', 'high']).default('normal')
    });
    
    const data = schema.parse(req.body);
    const tables = data.tables || ['transactions', 'accounts', 'beneficiaries', 'customers', 'watchlists'];
    
    const id = crypto.randomUUID();
    const jobId = `SCAN-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    db.prepare(`
      INSERT INTO scan_jobs (id, job_id, status, progress, tables_scanned)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, jobId, 'pending', 0, JSON.stringify(tables));
    
    const scan = db.prepare('SELECT * FROM scan_jobs WHERE id = ?').get(id);
    
    simulateScan(id);
    
    res.status(201).json({ ...scan, tables_scanned: JSON.parse(scan.tables_scanned) });
  } catch (e) {
    next(e);
  }
});

router.post('/:jobId/cancel', requireRole('admin', 'compliance_lead'), (req, res, next) => {
  try {
    const scan = db.prepare('SELECT * FROM scan_jobs WHERE job_id = ?').get(req.params.jobId);
    if (!scan) return res.status(404).json({ error: 'Scan job not found' });
    
    if (scan.status === 'completed' || scan.status === 'failed') {
      return res.status(400).json({ error: 'Cannot cancel completed scan' });
    }
    
    db.prepare('UPDATE scan_jobs SET status = ?, error_message = ?, completed_at = ? WHERE id = ?')
      .run('cancelled', 'Cancelled by user', Date.now(), scan.id);
    
    res.json({ message: 'Scan cancelled' });
  } catch (e) {
    next(e);
  }
});

function simulateScan(jobId) {
  let progress = 0;
  const interval = setInterval(() => {
    const scan = db.prepare('SELECT * FROM scan_jobs WHERE id = ?').get(jobId);
    if (!scan || scan.status !== 'running' && scan.status !== 'pending') {
      clearInterval(interval);
      return;
    }
    
    if (scan.status === 'pending') {
      db.prepare('UPDATE scan_jobs SET status = ?, started_at = ? WHERE id = ?')
        .run('running', Date.now(), jobId);
    }
    
    progress += Math.random() * 15 + 5;
    if (progress >= 100) {
      progress = 100;
      const violations = Math.floor(Math.random() * 20) + 5;
      db.prepare('UPDATE scan_jobs SET status = ?, progress = ?, completed_at = ?, violations_found = ? WHERE id = ?')
        .run('completed', 100, Date.now(), violations, jobId);
      clearInterval(interval);
    } else {
      db.prepare('UPDATE scan_jobs SET progress = ? WHERE id = ?').run(Math.floor(progress), jobId);
    }
  }, 2000 + Math.random() * 3000);
}

export default router;
