const express = require('express');
const { applySecurity, errorHandler } = require('./middleware/security');

const app = express();
applySecurity(app); // helmet, CORS allowlist, body limit, rate limits, /api/health

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Interview Coach API is running' });
});

app.use(errorHandler); // keep last

module.exports = app;
