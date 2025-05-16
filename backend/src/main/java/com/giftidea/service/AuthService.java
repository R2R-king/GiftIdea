package com.giftidea.service;

import com.giftidea.dto.AuthResponse;
import com.giftidea.dto.LoginRequest;
import com.giftidea.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
} 