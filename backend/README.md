# GiftIdea Backend

Бэкенд для приложения GiftIdea, предоставляющий API для генерации изображений с помощью GigaChat API.

## Установка

1. Установите зависимости:

```bash
npm install
```

2. Создайте файл `.env` на основе `.env.example`:

```bash
# Порт для запуска сервера
PORT=4000

# Ключ GigaChat API (замените на свой реальный ключ)
GIGACHAT_API_KEY=ваш_gigachat_api_key
```

## Запуск сервера

Для разработки (с автоматической перезагрузкой):

```bash
npm run dev
```

Для продакшена:

```bash
npm start
```

## API Endpoints

### Проверка работоспособности

```
GET /health
```

### Статус API

```
GET /api/status
```

### Статус GigaChat API

```
GET /api/gigachat/status
```

### Генерация изображения

```
POST /api/generate-image
```

Тело запроса:

```json
{
  "eventName": "Новый год",
  "prompt": "Нарисуй красивую иллюстрацию для события \"Новый год\". Изображение должно быть ярким, красочным и подходить для мобильного приложения."
}
```

Ответ:

```json
{
  "imageData": "base64_encoded_image_data",
  "eventName": "Новый год"
}
```

## Требования

- Node.js 14+
- Ключ доступа к GigaChat API 