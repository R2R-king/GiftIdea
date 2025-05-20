package com.giftidea.controller;

import com.giftidea.dto.ApiResponse;
import com.giftidea.dto.AuthResponse;
import com.giftidea.dto.LoginRequest;
import com.giftidea.dto.RegisterRequest;
import com.giftidea.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse authResponse = authService.register(request);
            return new ResponseEntity<>(
                    new ApiResponse<>("SUCCESS", "Регистрация успешна", authResponse),
                    HttpStatus.CREATED
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                    new ApiResponse<>("ERROR", e.getMessage(), null),
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse authResponse = authService.login(request);
            return new ResponseEntity<>(
                    new ApiResponse<>("SUCCESS", "Вход выполнен успешно", authResponse),
                    HttpStatus.OK
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                    new ApiResponse<>("ERROR", e.getMessage(), null),
                    HttpStatus.UNAUTHORIZED
            );
        }
    }
} 