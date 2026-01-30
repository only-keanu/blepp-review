package com.kei.review.auth;

import com.kei.review.auth.dto.AuthResponse;
import com.kei.review.auth.dto.LoginRequest;
import com.kei.review.auth.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refresh(String refreshToken);
    void logout(String refreshToken);
}
