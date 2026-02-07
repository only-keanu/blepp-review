package com.kei.review.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final SecretKey signingKey;
    private final long accessTokenMinutes;
    private final long refreshTokenMinutes;

    public JwtService(
        @Value("${app.jwt.secret}") String jwtSecret,
        @Value("${app.jwt.access-expiration-minutes:30}") long accessTokenMinutes,
        @Value("${app.jwt.refresh-expiration-minutes:43200}") long refreshTokenMinutes
    ) {
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
        this.accessTokenMinutes = accessTokenMinutes;
        this.refreshTokenMinutes = refreshTokenMinutes;
    }

    public String generateAccessToken(String subject, Map<String, Object> claims) {
        return generateToken(subject, claims, accessTokenMinutes);
    }

    public String generateRefreshToken(String subject) {
        return generateToken(subject, Map.of("typ", "refresh"), refreshTokenMinutes);
    }

    public String extractSubject(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    private String generateToken(String subject, Map<String, Object> claims, long minutes) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(minutes * 60);
        return Jwts.builder()
            .subject(subject)
            .claims(claims)
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiry))
            .signWith(signingKey)
            .compact();
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
