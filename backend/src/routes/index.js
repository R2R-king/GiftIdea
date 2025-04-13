const express = require('express');
const router = express.Router();
const gigachatRoutes = require('./gigachat');

// Используем все маршруты gigachat под /gigachat
router.use('/gigachat', gigachatRoutes);

// Базовый маршрут для проверки API
router.get('/status', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

module.exports = router; 