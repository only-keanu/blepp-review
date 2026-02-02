package com.kei.review.auth;

import com.kei.review.auth.dto.AuthResponse;
import com.kei.review.auth.dto.LoginRequest;
import com.kei.review.auth.dto.RegisterRequest;
import com.kei.review.auth.dto.OAuthCodeRequest;
import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.oauth.google.client-id:}")
    private String googleClientId;

    @Value("${app.oauth.google.client-secret:}")
    private String googleClientSecret;

    @Value("${app.oauth.facebook.app-id:}")
    private String facebookAppId;

    @Value("${app.oauth.facebook.app-secret:}")
    private String facebookAppSecret;

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

    @Override
    public AuthResponse oauthGoogle(OAuthCodeRequest request) {
        if (googleClientId == null || googleClientId.isBlank() ||
            googleClientSecret == null || googleClientSecret.isBlank()) {
            throw new IllegalStateException("Google OAuth is not configured");
        }

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", request.code());
        body.add("client_id", googleClientId);
        body.add("client_secret", googleClientSecret);
        body.add("redirect_uri", request.redirectUri());
        body.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);

        Map<?, ?> tokenResponse = restTemplate.postForObject(
            "https://oauth2.googleapis.com/token",
            entity,
            Map.class
        );
        if (tokenResponse == null || tokenResponse.get("id_token") == null) {
            throw new IllegalStateException("Unable to validate Google login");
        }

        String idToken = tokenResponse.get("id_token").toString();
        String tokenInfoUrl = UriComponentsBuilder
            .fromUriString("https://oauth2.googleapis.com/tokeninfo")
            .queryParam("id_token", idToken)
            .toUriString();

        Map<?, ?> tokenInfo = restTemplate.getForObject(tokenInfoUrl, Map.class);
        if (tokenInfo == null || tokenInfo.get("email") == null) {
            throw new IllegalStateException("Unable to fetch Google profile");
        }
        if (tokenInfo.get("aud") != null && !googleClientId.equals(tokenInfo.get("aud").toString())) {
            throw new IllegalStateException("Invalid Google token");
        }

        String email = tokenInfo.get("email").toString();
        String name = tokenInfo.get("name") != null ? tokenInfo.get("name").toString() : email;
        String picture = tokenInfo.get("picture") != null ? tokenInfo.get("picture").toString() : null;

        return loginOrCreateOAuthUser(email, name, picture);
    }
//test
    @Override
    public AuthResponse oauthFacebook(OAuthCodeRequest request) {
        if (facebookAppId == null || facebookAppId.isBlank() ||
            facebookAppSecret == null || facebookAppSecret.isBlank()) {
            throw new IllegalStateException("Facebook OAuth is not configured");
        }

        String tokenUrl = UriComponentsBuilder
            .fromUriString("https://graph.facebook.com/v18.0/oauth/access_token")
            .queryParam("client_id", facebookAppId)
            .queryParam("client_secret", facebookAppSecret)
            .queryParam("redirect_uri", request.redirectUri())
            .queryParam("code", request.code())
            .toUriString();

        Map<?, ?> tokenResponse = restTemplate.getForObject(tokenUrl, Map.class);
        if (tokenResponse == null || tokenResponse.get("access_token") == null) {
            throw new IllegalStateException("Unable to validate Facebook login");
        }

        String accessToken = tokenResponse.get("access_token").toString();
        String profileUrl = UriComponentsBuilder
            .fromUriString("https://graph.facebook.com/me")
            .queryParam("fields", "id,name,email,picture.width(200).height(200)")
            .queryParam("access_token", accessToken)
            .toUriString();

        Map<?, ?> profile = restTemplate.getForObject(profileUrl, Map.class);
        if (profile == null || profile.get("email") == null) {
            throw new IllegalStateException("Facebook email permission is required");
        }

        String email = profile.get("email").toString();
        String name = profile.get("name") != null ? profile.get("name").toString() : email;
        String picture = null;
        if (profile.get("picture") instanceof Map<?, ?> picMap) {
            Object data = picMap.get("data");
            if (data instanceof Map<?, ?> dataMap && dataMap.get("url") != null) {
                picture = dataMap.get("url").toString();
            }
        }

        return loginOrCreateOAuthUser(email, name, picture);
    }

    private AuthResponse loginOrCreateOAuthUser(String email, String name, String avatarUrl) {
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User created = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                .fullName(name)
                .avatarUrl(avatarUrl)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
            return userRepository.save(created);
        });

        if (user.getFullName() == null || user.getFullName().isBlank()) {
            user.setFullName(name);
        }
        if ((user.getAvatarUrl() == null || user.getAvatarUrl().isBlank()) && avatarUrl != null) {
            user.setAvatarUrl(avatarUrl);
        }
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);

        return authTokensFor(user);
    }

    private AuthResponse authTokensFor(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("uid", user.getId().toString());
        String accessToken = jwtService.generateAccessToken(user.getEmail(), claims);
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());
        return new AuthResponse(user.getId(), accessToken, refreshToken);
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
