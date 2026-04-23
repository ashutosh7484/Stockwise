const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'stockwise-super-secret-key-change-in-production';
const JWT_EXPIRES_IN = '8h';

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ─── In-Memory Database ───────────────────────────────────────────────────────

const db = {
  users: [],
  inventory: [],
};

// Seed some demo inventory items so the dashboard isn't empty on first load
db.inventory = [
  {
    id: uuidv4(),
    name: 'Wireless Mouse',
    quantity: 24,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Mechanical Keyboard',
    quantity: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'USB-C Hub',
    quantity: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Monitor Stand',
    quantity: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token expired or invalid' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

// ─── Auth Routes ──────────────────────────────────────────────────────────────

// POST /auth/register
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    // Validate role
    if (!['ADMIN', 'STAFF'].includes(role)) {
      return res.status(400).json({ message: 'Role must be ADMIN or STAFF' });
    }

    // Check if email already exists
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = {
      id: uuidv4(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    console.log(`[REGISTER] New user: ${newUser.email} (${newUser.role})`);

    return res.status(201).json({ message: 'Account created successfully' });
  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /auth/login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    console.log(`[LOGIN] ${user.email} (${user.role})`);

    return res.status(200).json({
      token,
      role: user.role,
      email: user.email,
    });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ─── Inventory Routes ─────────────────────────────────────────────────────────

// GET /inventory/items — all roles can view
app.get('/inventory/items', authenticate, (req, res) => {
  return res.status(200).json(db.inventory);
});

// POST /inventory/items — ADMIN only
app.post('/inventory/items', authenticate, requireAdmin, (req, res) => {
  const { name, quantity } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Item name is required' });
  }
  if (quantity === undefined || quantity === null || isNaN(quantity) || quantity < 0) {
    return res.status(400).json({ message: 'Quantity must be a non-negative number' });
  }

  const newItem = {
    id: uuidv4(),
    name: name.trim(),
    quantity: Number(quantity),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.inventory.unshift(newItem);
  console.log(`[CREATE ITEM] "${newItem.name}" qty:${newItem.quantity} by ${req.user.email}`);

  return res.status(201).json(newItem);
});

// POST /inventory/items/:id/stock-in — ADMIN only
app.post('/inventory/items/:id/stock-in', authenticate, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
    return res.status(400).json({ message: 'Quantity must be greater than 0' });
  }

  const item = db.inventory.find(i => i.id === id);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  item.quantity += Number(quantity);
  item.updatedAt = new Date().toISOString();

  console.log(`[STOCK IN] "${item.name}" +${quantity} => ${item.quantity} by ${req.user.email}`);

  return res.status(200).json(item);
});

// POST /inventory/items/:id/stock-out — ADMIN only
app.post('/inventory/items/:id/stock-out', authenticate, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
    return res.status(400).json({ message: 'Quantity must be greater than 0' });
  }

  const item = db.inventory.find(i => i.id === id);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  if (Number(quantity) > item.quantity) {
    return res.status(400).json({
      message: `Insufficient stock. Available: ${item.quantity}, requested: ${quantity}`,
    });
  }

  item.quantity -= Number(quantity);
  item.updatedAt = new Date().toISOString();

  console.log(`[STOCK OUT] "${item.name}" -${quantity} => ${item.quantity} by ${req.user.email}`);

  return res.status(200).json(item);
});

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime().toFixed(1) + 's',
    users: db.users.length,
    items: db.inventory.length,
  });
});

// ─── 404 fallback ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log('');
  console.log('  ┌─────────────────────────────────────┐');
  console.log('  │   Stockwise API running on :' + PORT + '    │');
  console.log('  ├─────────────────────────────────────┤');
  console.log('  │  POST  /auth/register               │');
  console.log('  │  POST  /auth/login                  │');
  console.log('  │  GET   /inventory/items             │');
  console.log('  │  POST  /inventory/items             │');
  console.log('  │  POST  /inventory/items/:id/stock-in│');
  console.log('  │  POST  /inventory/items/:id/stock-out│');
  console.log('  │  GET   /health                      │');
  console.log('  └─────────────────────────────────────┘');
  console.log('');
  console.log('  ⚠  Data is in-memory. Restarting clears users.');
  console.log('  ✓  4 demo inventory items pre-loaded.');
  console.log('');
});
