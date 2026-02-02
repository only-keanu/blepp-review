package com.kei.review.auth;

import com.kei.review.auth.dto.AuthResponse;
import com.kei.review.auth.dto.LoginRequest;
import com.kei.review.auth.dto.RegisterRequest;
import com.kei.review.auth.dto.OAuthCodeRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refresh(String refreshToken);
    void logout(String refreshToken);
    AuthResponse oauthGoogle(OAuthCodeRequest request);
    AuthResponse oauthFacebook(OAuthCodeRequest request);
}
