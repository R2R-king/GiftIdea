const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageGenerationController');

// Маршрут для генерации изображения
router.post('/generate-image', imageController.generateImage);

module.exports = router; 