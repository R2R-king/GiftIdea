const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Настройка CORS для работы с веб-приложением
const corsOptions = {
  origin: ['http://localhost:19006', 'http://localhost:19000', 'http://localhost:8081', 'http://localhost:3000', 'exp://localhost:19000', 'http://localhost'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions)); // Enable CORS with specific options
app.use(bodyParser.json()); // Parse JSON requests
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded requests

// Import routes
const routes = require('./routes');

// Preflight CORS handler for OPTIONS requests
app.options('*', cors(corsOptions));

// Use routes
app.use('/api', routes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`- Health check: http://localhost:${PORT}/health`);
  console.log(`- API status: http://localhost:${PORT}/api/status`);
  console.log(`- GigaChat status: http://localhost:${PORT}/api/gigachat/status`);
  console.log(`- GigaChat test: http://localhost:${PORT}/api/gigachat/test`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
  // In production, you might want to exit the process and let your process manager restart it
  // process.exit(1);
});

module.exports = app; 