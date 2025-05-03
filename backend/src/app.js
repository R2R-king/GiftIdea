const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const imageRoutes = require('./routes/imageRoutes');
const gigachatRoutes = require('./routes/gigachat');

// Загружаем переменные окружения из .env файла
dotenv.config();

// Инициализация приложения
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Базовый маршрут
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Проверка статуса API
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'API is operational' });
});

// Проверка статуса GigaChat API
app.get('/api/gigachat/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'GigaChat API configuration loaded',
    apiUrl: process.env.GIGACHAT_API_URL || GIGACHAT_API_URL,
    hasApiKey: !!process.env.GIGACHAT_API_KEY || 'not_set'
  });
});

// Тестовый эндпоинт для GigaChat
app.get('/api/gigachat/test', (req, res) => {
  res.json({ 
    message: 'Для тестирования GigaChat API отправьте POST запрос на /api/generate-image',
    example: {
      eventName: 'Новый год',
      prompt: 'Нарисуй красивую иллюстрацию для события "Новый год". Изображение должно быть ярким, красочным и подходить для мобильного приложения.'
    }
  });
});

// Маршруты API
app.use('/api', imageRoutes);
app.use('/api/gigachat', gigachatRoutes);

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`- Health check: http://localhost:${PORT}/health`);
  console.log(`- API status: http://localhost:${PORT}/api/status`);
  console.log(`- GigaChat test: http://localhost:${PORT}/api/gigachat/test`);
});

module.exports = app; 