require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const { globalRateLimiter } = require('./src/middlewares/rateLimit.middleware');
const errorHandler = require('./src/middlewares/error.middleware');
const routes = require('./src/routes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(globalRateLimiter);

app.use('/api', routes);

// Serve static files from frontend
app.use(express.static(path.join(__dirname, 'src/public')));

// Handle SPA routing - send index.html for any unknown requests
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'src/public', 'index.html'));
  } else {
    next();
  }
});

app.use(errorHandler);

module.exports = app;
