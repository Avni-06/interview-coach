const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { applySecurity, errorHandler } = require('./middleware/security');

dotenv.config();
connectDB();

const app = express();
applySecurity(app); // helmet, CORS allowlist, body limit, rate limits, /api/health

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Interview Coach API is running' });
});

app.use(errorHandler); // keep last

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));