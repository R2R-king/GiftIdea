# GiftIdea Backend

Простой backend на Spring Boot для приложения GiftIdea.

## Требования

- Java 17 или выше
- Maven

## Запуск приложения

1. Клонируйте репозиторий
2. Перейдите в папку проекта:
   ```
   cd backend
   ```
3. Запустите приложение с помощью Maven:
   ```
   mvn spring-boot:run
   ```
   
Приложение будет доступно по адресу: http://localhost:8080

## Доступ к H2 консоли

H2 консоль доступна по адресу: http://localhost:8080/h2-console

Параметры подключения:
- JDBC URL: `jdbc:h2:mem:giftideadb`
- Username: `sa`
- Password: `password`

## API Endpoints

### Products API

- `GET /api/products` - получить все товары
- `GET /api/products/{id}` - получить товар по ID
- `GET /api/products/category/{category}` - получить товары по категории
- `GET /api/products/search?keyword=value` - поиск товаров
- `POST /api/products` - создать новый товар
- `PUT /api/products/{id}` - обновить товар
- `DELETE /api/products/{id}` - удалить товар

### Cart API

- `GET /api/cart/{userId}` - получить корзину пользователя
- `POST /api/cart/{userId}/add` - добавить товар в корзину
- `PUT /api/cart/item/{cartItemId}` - обновить количество товара в корзине
- `DELETE /api/cart/item/{cartItemId}` - удалить товар из корзины
- `DELETE /api/cart/{userId}/clear` - очистить корзину пользователя

## Примеры запросов

### Добавление товара в корзину

```json
POST /api/cart/user123/add
{
  "productId": 1,
  "quantity": 2
}
```

### Обновление количества товара в корзине

```json
PUT /api/cart/item/1
{
  "quantity": 3
}
``` 