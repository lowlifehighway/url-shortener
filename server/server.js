import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'links.json');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// In-Memory Cache
let cache = {};

function loadCache() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const arr = JSON.parse(raw);
    cache = Object.fromEntries(arr.map((link) => [link.id, link]));
    console.log(`Cache loaded: ${Object.keys(cache).length} links`);
  } catch {
    cache = {};
    console.log('No existing links.json found, starting fresh');
  }
}

loadCache();

// Buffered Save
let saveTimer = null;
const SAVE_DELAY_MS = 300;

function bufferedSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const arr = Object.values(cache);
    fs.writeFile(DB_PATH, JSON.stringify(arr, null, 2), (err) => {
      if (err) console.error('Failed to save links.json:', err);
    });
  }, SAVE_DELAY_MS);
}

// Rate Limiting
const rateLimitMap = {};
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip) {
  const now = Date.now();
  if (
    !rateLimitMap[ip] ||
    now - rateLimitMap[ip].windowStart > RATE_WINDOW_MS
  ) {
    rateLimitMap[ip] = { count: 1, windowStart: now };
    return false;
  }
  rateLimitMap[ip].count++;
  return rateLimitMap[ip].count > RATE_LIMIT;
}

// Helpers
function generateShortCode(length = 6) {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

function nowUTC() {
  return new Date().toISOString();
}

function isExpired(link) {
  if (!link.expires) return false;
  return new Date() > new Date(link.expires);
}

// POST /api/links — Create a short link
app.post('/api/links', (req, res) => {
  if (isRateLimited(req.ip)) {
    return res
      .status(429)
      .json({ error: 'Too many requests. Please slow down.' });
  }

  const { long_url, pin } = req.body;

  if (!long_url) {
    return res.status(400).json({ error: 'long_url is required.' });
  }

  try {
    new URL(long_url);
  } catch {
    return res.status(400).json({ error: 'long_url must be a valid URL.' });
  }

  let id = generateShortCode();
  while (cache[id]) id = generateShortCode();

  const now = nowUTC();
  const expires = new Date(Date.now() + 30 * 86_400_000).toISOString();

  const link = {
    id,
    long_url,
    pin: pin ? String(pin) : null,
    clicked: 0,
    created: now,
    expires,
  };

  cache[id] = link;
  bufferedSave();

  return res.status(201).json({
    id,
    short_url: `${req.protocol}://${req.get('host')}/${id}`,
    long_url,
    created: now,
    expires,
  });
});

// GET /:shortCode — Redirect or prompt for PIN
app.get('/api/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const link = cache[shortCode];

  if (!link) {
    return res.status(404).json({ error: 'Link not found.' });
  }

  if (isExpired(link)) {
    delete cache[shortCode];
    bufferedSave();
    return res.status(404).json({ error: 'This link has expired.' });
  }

  if (link.pin) {
    return res.status(200).json({
      requiresPin: true,
      id: link.id,
    });
  }
});

// POST /:shortCode/verify — Verify PIN and return URL
app.post('/api/:shortCode/verify', (req, res) => {
  if (isRateLimited(req.ip)) {
    return res
      .status(429)
      .json({ error: 'Too many requests. Please slow down.' });
  }

  const { shortCode } = req.params;
  const { pin } = req.body;
  const link = cache[shortCode];

  if (!link) {
    return res.status(404).json({ error: 'Link not found.' });
  }

  if (isExpired(link)) {
    delete cache[shortCode];
    bufferedSave();
    return res.status(404).json({ error: 'This link has expired.' });
  }

  if (!pin) {
    return res.status(400).json({ error: 'PIN is required.' });
  }

  if (String(pin) !== link.pin) {
    return res.status(400).json({ error: 'Incorrect PIN.' });
  }
  link.clicked++;
  bufferedSave();
  return res.status(200).json({ long_url: link.long_url });
});

// Start
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`LinkVault API running on http://localhost:${PORT}`);
});
