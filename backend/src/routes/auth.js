import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import db from '../db/init.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { strictRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100),
  role: z.enum(['analyst', 'senior_analyst', 'compliance_lead', 'admin']).optional()
});

router.post('/login', strictRateLimiter(5, 15 * 60 * 1000), (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(Date.now(), user.id);
    
    const token = generateToken(user);
    const { password_hash: _passwordHash, ...userSafe } = user;
    
    res.json({ token, user: userSafe });
  } catch (e) {
    next(e);
  }
});

router.post('/register', authenticateToken, (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can register users' });
    }
    
    const { email, password, name, role = 'analyst' } = registerSchema.parse(req.body);
    
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    const passwordHash = bcrypt.hashSync(password, 10);
    const id = crypto.randomUUID();
    
    db.prepare('INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)')
      .run(id, email, passwordHash, name, role);
    
    const user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(id);
    res.status(201).json({ user });
  } catch (e) {
    next(e);
  }
});

router.get('/me', authenticateToken, (req, res) => {
  const { password_hash: _passwordHash, ...userSafe } = req.user;
  res.json({ user: userSafe });
});

router.post('/refresh', authenticateToken, (req, res) => {
  const token = generateToken(req.user);
  res.json({ token });
});

router.post('/change-password', authenticateToken, (req, res, next) => {
  try {
    const schema = z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8)
    });
    
    const { currentPassword, newPassword } = schema.parse(req.body);
    
    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
    if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    const newHash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);
    
    res.json({ message: 'Password updated successfully' });
  } catch (e) {
    next(e);
  }
});

export default router;
