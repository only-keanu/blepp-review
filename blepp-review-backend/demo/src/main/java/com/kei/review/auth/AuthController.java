package com.kei.review.auth;

import com.kei.review.auth.dto.AuthResponse;
import com.kei.review.auth.dto.LoginRequest;
import com.kei.review.auth.dto.OAuthCodeRequest;
import com.kei.review.auth.dto.RefreshRequest;
import com.kei.review.auth.dto.RegisterRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return new ResponseEntity<>(authService.register(request), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
        @RequestHeader(value = "Authorization", required = false) String refreshToken,
        @RequestBody(required = false) RefreshRequest request
    ) {
        String token = refreshToken != null ? refreshToken : request == null ? null : request.refreshToken();
        return ResponseEntity.ok(authService.refresh(token));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String refreshToken) {
        authService.logout(refreshToken);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/oauth/google")
    public ResponseEntity<AuthResponse> oauthGoogle(@Valid @RequestBody OAuthCodeRequest request) {
        return ResponseEntity.ok(authService.oauthGoogle(request));
    }

    @PostMapping("/oauth/facebook")
    public ResponseEntity<AuthResponse> oauthFacebook(@Valid @RequestBody OAuthCodeRequest request) {
        return ResponseEntity.ok(authService.oauthFacebook(request));
    }
}
