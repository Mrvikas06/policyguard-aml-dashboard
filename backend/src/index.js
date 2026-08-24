import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import db from './db/init.js';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import threatRoutes from './routes/threats.js';
import ruleRoutes from './routes/rules.js';
import caseRoutes from './routes/cases.js';
import reportRoutes from './routes/reports.js';
import networkRoutes from './routes/network.js';
import statsRoutes from './routes/stats.js';
import scanRoutes from './routes/scans.js';
import auditRoutes from './routes/audit.js';
import { authenticateToken, optionalAuth } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { setupWebSocket } from './services/websocket.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

setupWebSocket(io);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', authenticateToken, transactionRoutes);
app.use('/api/threats', authenticateToken, threatRoutes);
app.use('/api/rules', authenticateToken, ruleRoutes);
app.use('/api/cases', authenticateToken, caseRoutes);
app.use('/api/reports', authenticateToken, reportRoutes);
app.use('/api/network', authenticateToken, networkRoutes);
app.use('/api/stats', authenticateToken, statsRoutes);
app.use('/api/scans', authenticateToken, scanRoutes);
app.use('/api/audit', authenticateToken, auditRoutes);

app.get('/api/live/transactions', authenticateToken, async (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT t.txn_id, t.amount, t.payment_format, t.timestamp, t.is_laundering,
             a1.account_number as from_account, a2.account_number as to_account
      FROM transactions t
      JOIN accounts a1 ON t.from_account_id = a1.id
      JOIN accounts a2 ON t.to_account_id = a2.id
      ORDER BY t.timestamp DESC
      LIMIT 20
    `);
    const txns = stmt.all();
    res.json(txns);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/live/threats', authenticateToken, async (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT th.threat_id, th.severity, th.status, th.confidence, th.detected_at,
             r.rule_id, r.category as rule_category,
             t.txn_id, t.amount, t.payment_format
      FROM threats th
      JOIN rules r ON th.rule_id = r.rule_id
      JOIN transactions t ON th.transaction_id = t.id
      ORDER BY th.detected_at DESC
      LIMIT 20
    `);
    const threats = stmt.all();
    res.json(threats);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`PolicyGuard API Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`WebSocket enabled for real-time updates`);
});

export { app, io };