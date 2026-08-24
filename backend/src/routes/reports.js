import express from 'express';
import { z } from 'zod';
import db from '../db/init.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

const reportTypes = ['AML Summary', 'Threat Report', 'Transaction Report', 'Compliance Report', 'SAR Report', 'AI Risk Report'];

router.get('/', (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const type = req.query.type;
    
    let where = ['1=1'];
    const params = [];
    
    if (status) { where.push('status = ?'); params.push(status); }
    if (type) { where.push('type = ?'); params.push(type); }
    
    const whereClause = where.join(' AND ');
    
    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM reports WHERE ${whereClause}`);
    const { total } = countStmt.get(...params);
    
    const dataStmt = db.prepare(`
      SELECT r.*, u.name as generated_by_name
      FROM reports r
      LEFT JOIN users u ON r.generated_by = u.id
      WHERE ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `);
    const reports = dataStmt.all(...params, limit, offset);
    
    res.json({
      data: reports.map(r => ({ ...r, filters: r.filters ? JSON.parse(r.filters) : {}, content: r.content ? JSON.parse(r.content) : {} })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (e) {
    next(e);
  }
});

router.get('/types', (req, res) => {
  res.json(reportTypes);
});

router.get('/:reportId', (req, res, next) => {
  try {
    const report = db.prepare(`
      SELECT r.*, u.name as generated_by_name
      FROM reports r
      LEFT JOIN users u ON r.generated_by = u.id
      WHERE r.report_id = ?
    `).get(req.params.reportId);
    
    if (!report) return res.status(404).json({ error: 'Report not found' });
    
    res.json({ ...report, filters: JSON.parse(report.filters || '{}'), content: JSON.parse(report.content || '{}') });
  } catch (e) {
    next(e);
  }
});

router.post('/', requireRole('analyst', 'senior_analyst', 'compliance_lead', 'admin'), (req, res, next) => {
  try {
    const schema = z.object({
      type: z.enum(reportTypes),
      title: z.string().min(5).max(200),
      filters: z.object({
        date_range: z.string().optional(),
        severity: z.string().optional(),
        status: z.string().optional(),
        rule_ids: z.array(z.string()).optional(),
        analyst_ids: z.array(z.string()).optional()
      }).default({}),
      schedule: z.enum(['once', 'daily', 'weekly', 'monthly']).optional()
    });
    
    const data = schema.parse(req.body);
    const id = crypto.randomUUID();
    const reportId = `RPT-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    const content = generateReportContent(data.type, data.filters);
    
    db.prepare(`
      INSERT INTO reports (id, report_id, type, title, status, generated_by, content, filters)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, reportId, data.type, data.title, 'generating', req.user.id, JSON.stringify(content), JSON.stringify(data.filters));
    
    setTimeout(() => {
      db.prepare('UPDATE reports SET status = ?, completed_at = ? WHERE id = ?')
        .run('generated', Date.now(), id);
    }, 2000);
    
    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(id);
    res.status(201).json({ ...report, filters: JSON.parse(report.filters), content: JSON.parse(report.content) });
  } catch (e) {
    next(e);
  }
});

router.post('/:reportId/regenerate', requireRole('analyst', 'senior_analyst', 'compliance_lead', 'admin'), (req, res, next) => {
  try {
    const report = db.prepare('SELECT * FROM reports WHERE report_id = ?').get(req.params.reportId);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    
    const filters = JSON.parse(report.filters || '{}');
    const content = generateReportContent(report.type, filters);
    
    db.prepare('UPDATE reports SET status = ?, content = ?, completed_at = ? WHERE id = ?')
      .run('generating', JSON.stringify(content), null, report.id);
    
    setTimeout(() => {
      db.prepare('UPDATE reports SET status = ?, completed_at = ? WHERE id = ?')
        .run('generated', Date.now(), report.id);
    }, 2000);
    
    res.json({ message: 'Regeneration started' });
  } catch (e) {
    next(e);
  }
});

function generateReportContent(type, filters) {
  const stats = db.prepare('SELECT COUNT(*) as total FROM threats').get();
  const threatsBySeverity = db.prepare('SELECT severity, COUNT(*) as count FROM threats GROUP BY severity').all();
  const casesByStatus = db.prepare('SELECT status, COUNT(*) as count FROM cases GROUP BY status').all();
  const txnStats = db.prepare('SELECT COUNT(*) as total, SUM(amount) as volume FROM transactions').get();
  
  const baseContent = {
    generated_at: new Date().toISOString(),
    filters,
    summary: {
      total_threats: stats.total,
      threats_by_severity: threatsBySeverity,
      cases_by_status: casesByStatus,
      transaction_volume: txnStats.volume,
      total_transactions: txnStats.total
    }
  };
  
  switch (type) {
    case 'AML Summary':
      return { ...baseContent, sections: ['Executive Summary', 'Threat Overview', 'Case Status', 'Regulatory Compliance', 'Recommendations'] };
    case 'Threat Report':
      return { ...baseContent, sections: ['Threat Landscape', 'Rule Effectiveness', 'Emerging Patterns', 'Investigation Outcomes'] };
    case 'Transaction Report':
      return { ...baseContent, sections: ['Volume Analysis', 'Cross-border Flows', 'High-value Transactions', 'Suspicious Patterns'] };
    case 'Compliance Report':
      return { ...baseContent, sections: ['Rule Coverage', 'Test Results', 'Gap Analysis', 'Remediation Tracking'] };
    case 'SAR Report':
      return { ...baseContent, sections: ['SAR Filings', 'Case Narratives', 'Evidence Packages', 'Regulatory Deadlines'] };
    case 'AI Risk Report':
      return { ...baseContent, sections: ['Model Performance', 'False Positive Rate', 'Feature Importance', 'Drift Metrics'] };
    default:
      return baseContent;
  }
}

export default router;