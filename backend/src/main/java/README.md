# GiftIdea Java Backend

Java Spring Boot бэкенд для приложения GiftIdea, которое позволяет пользователям находить и управлять идеями подарков.

## Технический стек

- Java 17
- Spring Boot 3.2.3
- Spring Data JPA
- Lombok
- H2 Database (in-memory)

## Запуск приложения

Вы можете запустить приложение, используя:

```bash
# Windows
run.bat

# Linux/Mac
./mvnw spring-boot:run
```

Сервер запустится на порту 8080.

## API Endpoints

### Gift API

| Метод | URL | Описание |
|-------|-----|----------|
| GET | /api/gifts | Получить все подарки |
| GET | /api/gifts/{id} | Получить подарок по ID |
| POST | /api/gifts | Создать новый подарок |
| PUT | /api/gifts/{id} | Обновить существующий подарок |
| DELETE | /api/gifts/{id} | Удалить подарок |
| GET | /api/gifts/category/{category} | Получить подарки по категории |
| GET | /api/gifts/favorites | Получить избранные подарки |
| GET | /api/gifts/search?keyword={keyword} | Поиск подарков по названию |
| GET | /api/gifts/price?maxPrice={maxPrice} | Получить подарки с ценой до maxPrice |
| PUT | /api/gifts/{id}/favorite | Переключить статус "избранное" |

### Модель данных Gift

```json
{
  "id": 1,
  "name": "Умные часы",
  "description": "Стильные умные часы с мониторингом здоровья",
  "category": "Электроника",
  "price": 149.99,
  "imageUrl": "https://example.com/watch.jpg",
  "favorite": false
}
```

### Формат ответа API

Все API-вызовы возвращают данные в формате ApiResponse:

```json
{
  "result": "SUCCESS", // или "ERROR"
  "message": "Operation completed successfully", // или сообщение об ошибке
  "data": { ... } // объект или массив данных (может быть null в случае ошибки)
}
```

## H2 Console

Вы можете получить доступ к консоли базы данных H2 через браузер по адресу:
http://localhost:8080/h2-console

Параметры подключения:
- JDBC URL: jdbc:h2:mem:giftidea
- Username: sa
- Password: password

## Примеры использования API

### Получение всех подарков

```bash
curl -X GET http://localhost:8080/api/gifts
```

### Создание нового подарка

```bash
curl -X POST http://localhost:8080/api/gifts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Новый подарок",
    "description": "Описание нового подарка",
    "category": "Категория",
    "price": 99.99,
    "imageUrl": "https://example.com/image.jpg",
    "favorite": false
  }'
```

### Обновление подарка

```bash
curl -X PUT http://localhost:8080/api/gifts/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Обновленный подарок",
    "description": "Новое описание",
    "category": "Новая категория",
    "price": 129.99,
    "imageUrl": "https://example.com/new-image.jpg",
    "favorite": true
  }'
```

### Удаление подарка

```bash
curl -X DELETE http://localhost:8080/api/gifts/1
``` 