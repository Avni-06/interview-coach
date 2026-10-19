const helmet = require('helmet');
const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');

const DEFAULT_ORIGINS = ['http://localhost:5173', 'https://interview-coach-sable.vercel.app'];

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
        if (!origin || allowed.includes(origin)) return cb(null, true);
        return cb(new Error('Not allowed by CORS'));
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
