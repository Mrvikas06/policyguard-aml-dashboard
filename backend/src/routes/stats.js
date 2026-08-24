import express from 'express';
import db from '../db/init.js';

const router = express.Router();

router.get('/overview', (req, res, next) => {
  try {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    
    const stats = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM transactions) as total_transactions,
        (SELECT COUNT(*) FROM transactions WHERE is_laundering = 1) as flagged_transactions,
        (SELECT COUNT(*) FROM threats) as total_threats,
        (SELECT COUNT(*) FROM threats WHERE severity = 'critical') as critical_threats,
        (SELECT COUNT(*) FROM threats WHERE status = 'open') as open_threats,
        (SELECT COUNT(*) FROM threats WHERE status = 'investigating') as investigating_threats,
        (SELECT COUNT(*) FROM cases) as total_cases,
        (SELECT COUNT(*) FROM cases WHERE status IN ('new', 'investigating', 'escalated', 'awaiting_review')) as active_cases,
        (SELECT COUNT(*) FROM accounts) as total_accounts,
        (SELECT COUNT(*) FROM accounts WHERE risk_score > 70) as high_risk_accounts,
        (SELECT COUNT(*) FROM rules WHERE is_active = 1) as active_rules,
        (SELECT AVG(confidence) FROM threats) as avg_confidence
    `).get();
    
    const trend = db.prepare(`
      SELECT 
        date(detected_at/1000, 'unixepoch') as day,
        COUNT(*) as threats,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical
      FROM threats
      WHERE detected_at > ?
      GROUP BY day
      ORDER BY day
    `).all(now - 30 * day);
    
    const volumeTrend = db.prepare(`
      SELECT 
        date(timestamp/1000, 'unixepoch') as day,
        COUNT(*) as count,
        SUM(amount) as volume,
        SUM(CASE WHEN is_laundering = 1 THEN 1 ELSE 0 END) as flagged
      FROM transactions
      WHERE timestamp > ?
      GROUP BY day
      ORDER BY day
    `).all(now - 30 * day);
    
    const ruleEffectiveness = db.prepare(`
      SELECT r.rule_id, r.category, r.precision, r.trigger_count,
             COUNT(th.id) as recent_triggers
      FROM rules r
      LEFT JOIN threats th ON th.rule_id = r.rule_id AND th.detected_at > ?
      WHERE r.is_active = 1
      GROUP BY r.id
      ORDER BY r.precision DESC
    `).all(now - 7 * day);
    
    const topCountries = db.prepare(`
      SELECT a.country, COUNT(DISTINCT t.id) as txn_count, SUM(t.amount) as volume
      FROM transactions t
      JOIN accounts a ON t.from_account_id = a.id
      WHERE t.timestamp > ?
      GROUP BY a.country
      ORDER BY txn_count DESC
      LIMIT 10
    `).all(now - 30 * day);
    
    const paymentFormats = db.prepare(`
      SELECT payment_format, COUNT(*) as count, SUM(amount) as volume
      FROM transactions
      WHERE timestamp > ?
      GROUP BY payment_format
      ORDER BY count DESC
    `).all(now - 30 * day);
    
    res.json({
      summary: stats,
      threatTrend: trend,
      volumeTrend,
      ruleEffectiveness,
      topCountries,
      paymentFormats
    });
  } catch (e) {
    next(e);
  }
});

router.get('/kpis', (req, res, next) => {
  try {
    const kpis = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM transactions WHERE timestamp > ?) as txns_24h,
        (SELECT COUNT(*) FROM threats WHERE detected_at > ? AND severity = 'critical') as critical_24h,
        (SELECT COUNT(*) FROM threats WHERE detected_at > ?) as threats_24h,
        (SELECT AVG(confidence) FROM threats WHERE detected_at > ?) as avg_conf_24h,
        (SELECT COUNT(*) FROM cases WHERE created_at > ?) as cases_24h,
        (SELECT COUNT(*) FROM accounts WHERE risk_score > 70) as high_risk_accounts
    `).get(Date.now() - 24 * 60 * 60 * 1000, Date.now() - 24 * 60 * 60 * 1000, Date.now() - 24 * 60 * 60 * 1000, Date.now() - 24 * 60 * 60 * 1000, Date.now() - 24 * 60 * 60 * 1000);
    
    res.json(kpis);
  } catch (e) {
    next(e);
  }
});

router.get('/compliance-score', (req, res, next) => {
  try {
    const score = db.prepare(`
      SELECT 
        (SELECT AVG(precision) FROM rules WHERE is_active = 1) as rule_precision,
        (SELECT COUNT(*) FROM threats WHERE status = 'resolved') * 1.0 / 
         NULLIF((SELECT COUNT(*) FROM threats), 0) as resolution_rate,
        (SELECT COUNT(*) FROM cases WHERE status = 'resolved') * 1.0 / 
         NULLIF((SELECT COUNT(*) FROM cases), 0) as case_resolution_rate,
        (SELECT 1 - AVG(confidence) FROM threats WHERE status = 'false_positive') as fp_rate
    `).get();
    
    const weights = { rule_precision: 0.3, resolution_rate: 0.25, case_resolution_rate: 0.25, fp_rate: 0.2 };
    const complianceScore = Math.round(
      (score.rule_precision || 0) * weights.rule_precision * 100 +
      (score.resolution_rate || 0) * weights.resolution_rate * 100 +
      (score.case_resolution_rate || 0) * weights.case_resolution_rate * 100 +
      ((score.fp_rate || 0) * weights.fp_rate) * 100
    );
    
    res.json({ score: Math.max(0, Math.min(100, complianceScore)), breakdown: score });
  } catch (e) {
    next(e);
  }
});

export default router;