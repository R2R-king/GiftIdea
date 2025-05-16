package com.giftidea.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "Имя пользователя не может быть пустым")
    String username,

    @NotBlank(message = "Пароль не может быть пустым")
    String password
) {
    // Компактный канонический конструктор для валидации
    public LoginRequest {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Имя пользователя не может быть пустым");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Пароль не может быть пустым");
        }
    }
} 