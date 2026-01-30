package com.kei.review.auth;

import com.kei.review.auth.dto.AuthResponse;
import com.kei.review.auth.dto.LoginRequest;
import com.kei.review.auth.dto.RegisterRequest;
import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.time.Instant;
import java.util.Map;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(existing -> {
            throw new IllegalStateException("Email already registered");
        });

        User user = User.builder()
            .email(request.email())
            .passwordHash(passwordEncoder.encode(request.password()))
            .fullName(request.fullName())
            .targetExamDate(request.targetExamDate())
            .dailyStudyHours(request.dailyStudyHours())
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();

        User saved = userRepository.save(user);
        String accessToken = jwtService.generateAccessToken(
            saved.getEmail(),
            Map.of("uid", saved.getId().toString())
        );
        String refreshToken = jwtService.generateRefreshToken(saved.getEmail());

        return new AuthResponse(saved.getId(), accessToken, refreshToken);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new IllegalStateException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalStateException("Invalid credentials");
        }

        String accessToken = jwtService.generateAccessToken(
            user.getEmail(),
            Map.of("uid", user.getId().toString())
        );
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        return new AuthResponse(user.getId(), accessToken, refreshToken);
    }

    @Override
    public AuthResponse refresh(String refreshToken) {
        String token = normalizeToken(refreshToken);
        if (!jwtService.isTokenValid(token)) {
            throw new IllegalStateException("Invalid refresh token");
        }

        String subject = jwtService.extractSubject(token);
        User user = userRepository.findByEmail(subject)
            .orElseThrow(() -> new IllegalStateException("Invalid refresh token"));

        String accessToken = jwtService.generateAccessToken(
            user.getEmail(),
            Map.of("uid", user.getId().toString())
        );
        String newRefreshToken = jwtService.generateRefreshToken(user.getEmail());

        return new AuthResponse(user.getId(), accessToken, newRefreshToken);
    }

    @Override
    public void logout(String refreshToken) {
        // Stateless JWT logout is a no-op unless token revocation is added.
    }

    private String normalizeToken(String token) {
        if (token == null) {
            return "";
        }
        if (token.startsWith("Bearer ")) {
            return token.substring(7);
        }
        return token;
    }
}
