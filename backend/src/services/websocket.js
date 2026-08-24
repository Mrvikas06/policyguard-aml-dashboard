import jwt from 'jsonwebtoken';
import db from '../db/init.js';

const JWT_SECRET = process.env.JWT_SECRET || 'policyguard-super-secret-key-change-in-production';

const clientSubscriptions = new Map();
const liveTransactionBuffer = [];
const liveThreatBuffer = [];
const MAX_BUFFER_SIZE = 100;

function generateMockTransaction() {
  const formats = ['WIRE', 'TRANSFER', 'CASH_OUT', 'PAYMENT', 'ACH', 'SWIFT'];
  const accounts = db.prepare('SELECT account_number FROM accounts ORDER BY RANDOM() LIMIT 2').all();
  if (accounts.length < 2) return null;
  
  const amount = Math.random() < 0.02 
    ? Math.floor(Math.random() * 90000) + 10000
    : Math.floor(Math.random() * 10000) + 100;
  
  const isLaundering = amount > 10000 || (amount >= 9000 && amount <= 9999 && Math.random() < 0.3) ? 1 : 0;
  
  return {
    txn_id: `TXN-${Date.now().toString().slice(-5)}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`,
    from_account: accounts[0].account_number,
    to_account: accounts[1].account_number,
    amount,
    payment_format: formats[Math.floor(Math.random() * formats.length)],
    timestamp: Date.now(),
    is_laundering: isLaundering,
    status: isLaundering ? 'flagged' : 'clean'
  };
}

function generateMockThreat(txn) {
  const rules = db.prepare('SELECT rule_id, category, severity FROM rules WHERE is_active = 1 ORDER BY RANDOM() LIMIT 1').get();
  if (!rules) return null;
  
  return {
    threat_id: `V-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
    rule_id: rules.rule_id,
    rule_category: rules.category,
    severity: rules.severity,
    txn_id: txn.txn_id,
    amount: txn.amount,
    confidence: 0.75 + Math.random() * 0.24,
    detected_at: Date.now(),
    status: 'open'
  };
}

function broadcastLiveTransaction(io) {
  const txn = generateMockTransaction();
  if (!txn) return;
  
  liveTransactionBuffer.unshift(txn);
  if (liveTransactionBuffer.length > MAX_BUFFER_SIZE) {
    liveTransactionBuffer.pop();
  }
  
  io.to('live-transactions').emit('transaction:new', txn);
  
  if (txn.is_laundering) {
    const threat = generateMockThreat(txn);
    if (threat) {
      liveThreatBuffer.unshift(threat);
      if (liveThreatBuffer.length > MAX_BUFFER_SIZE) liveThreatBuffer.pop();
      io.to('live-threats').emit('threat:new', threat);
    }
  }
}

function broadcastSystemHealth(io) {
  const health = {
    system_health: 99.5 + Math.random() * 0.5,
    model_status: Math.random() > 0.05 ? 'Healthy' : 'Degraded',
    pipeline_status: Math.random() > 0.02 ? 'Stable' : 'Backlog',
    latency: Math.floor(100 + Math.random() * 100),
    timestamp: Date.now()
  };
  io.to('sentinel').emit('health:update', health);
}

function startSimulation(io) {
  setInterval(() => broadcastLiveTransaction(io), 3000 + Math.random() * 7000);
  setInterval(() => broadcastSystemHealth(io), 10000);
  console.log('Live data simulation started');
}

export function setupWebSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(decoded.id);
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (e) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.user.email} (${socket.id})`);
    
    socket.on('subscribe', (channels) => {
      const channelArray = Array.isArray(channels) ? channels : [channels];
      for (const channel of channelArray) {
        socket.join(channel);
        if (!clientSubscriptions.has(socket.id)) {
          clientSubscriptions.set(socket.id, new Set());
        }
        clientSubscriptions.get(socket.id).add(channel);
      }
      socket.emit('subscribed', Array.from(clientSubscriptions.get(socket.id)));
    });

    socket.on('unsubscribe', (channels) => {
      const channelArray = Array.isArray(channels) ? channels : [channels];
      for (const channel of channelArray) {
        socket.leave(channel);
        if (clientSubscriptions.has(socket.id)) {
          clientSubscriptions.get(socket.id).delete(channel);
        }
      }
    });

    socket.on('get-live-buffer', (channel) => {
      if (channel === 'live-transactions') {
        socket.emit('buffer:live-transactions', liveTransactionBuffer.slice(0, 20));
      } else if (channel === 'live-threats') {
        socket.emit('buffer:live-threats', liveThreatBuffer.slice(0, 20));
      }
    });

    socket.on('disconnect', () => {
      clientSubscriptions.delete(socket.id);
      console.log(`Client disconnected: ${socket.user.email}`);
    });
  });

  startSimulation(io);
  
  return {
    broadcastLiveTransaction: () => broadcastLiveTransaction(io),
    broadcastSystemHealth: () => broadcastSystemHealth(io),
    getLiveTransactions: () => liveTransactionBuffer,
    getLiveThreats: () => liveThreatBuffer
  };
}