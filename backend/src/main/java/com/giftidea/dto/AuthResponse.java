package com.giftidea.dto;

public record AuthResponse(
    String token,
    String username,
    String email
) {
    // Компактный канонический конструктор для валидации
    public AuthResponse {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Токен не может быть пустым");
        }
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Имя пользователя не может быть пустым");
        }
    }
} 