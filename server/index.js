require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pgService = require('./src/db/pgService');

const app = express();

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/voters', require('./routes/voters'));
app.use('/api/candidates', require('./routes/candidates'));
app.use('/api/votes', require('./routes/votes'));
app.use('/api/results', require('./routes/results'));
app.use('/api/email', require('./routes/email'));
app.use('/api/export', require('./routes/export'));

// Health check endpoint
app.get('/health', async (req, res) => {
  const pgReady = await pgService.isAvailable();
  res.json({ status: 'ok', database: pgReady ? 'postgresql' : 'disconnected', message: 'E-Voting Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  try {
    await pgService.createSchema();
    console.log('PostgreSQL schema initialized');
  } catch (err) {
    console.error('Failed to initialize PostgreSQL schema:', err.message);
  }
});

module.exports = app;
