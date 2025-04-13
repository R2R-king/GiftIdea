import express from 'express';
import gigachatRoutes from './gigachat.js';
import authRoutes from './auth.js';

const router = express.Router();

// Используем все маршруты gigachat под /gigachat
router.use('/gigachat', gigachatRoutes);

// Используем авторизационные маршруты под /auth
router.use('/auth', authRoutes);

// Базовый маршрут для проверки API
router.get('/status', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

export default router; 