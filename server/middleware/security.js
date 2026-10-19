const helmet = require('helmet');
const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');

const DEFAULT_ORIGINS = ['https://interview-coach-sable.vercel.app'];
// Any local dev server (Vite may pick 5173, 5174, ... or use 127.0.0.1). Auth uses Bearer tokens, not cookies.
const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function applySecurity(app) {
  // Render sits behind a proxy; needed so rate limiting sees the real client IP
  app.set('trust proxy', 1);
  app.use(helmet());

  const allowed = [
    ...DEFAULT_ORIGINS,
    ...(process.env.CLIENT_URL || '').split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean),
  ];
  app.use(
    cors({
      origin: (origin, cb) => {
        // no origin = curl / server-to-server / health checks
        if (!origin || allowed.includes(origin) || LOCAL_ORIGIN.test(origin)) return cb(null, true);
        return cb(Object.assign(new Error(`Not allowed by CORS: ${origin}`), { status: 403 }));
      },
    })
  );

  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  const limiter = (limit, message) =>
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message },
    });

  app.use('/api/auth', limiter(20, 'Too many attempts, try again in 15 minutes'));
  app.use('/api/ai', limiter(60, 'Too many AI requests, slow down'));
}

function errorHandler(err, _req, res, _next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: status === 500 ? 'Server error' : err.message });
}

module.exports = { applySecurity, errorHandler };
