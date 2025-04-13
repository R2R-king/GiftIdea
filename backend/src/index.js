const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON requests
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded requests

// Import routes
const routes = require('./routes');

// Use routes
app.use('/api', routes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
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