package com.kei.review.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;
import org.junit.jupiter.api.Test;

class JwtServiceTest {
    private static final String TEST_SECRET = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

    @Test
    void generatedAccessTokenPreservesSubjectWhenClaimsArePresent() {
        JwtService jwtService = new JwtService(TEST_SECRET, 30, 43200);

        String token = jwtService.generateAccessToken("learner@example.com", Map.of("uid", "user-id"));

        assertTrue(jwtService.isTokenValid(token));
        assertTrue(jwtService.isAccessToken(token));
        assertFalse(jwtService.isRefreshToken(token));
        assertEquals("learner@example.com", jwtService.extractSubject(token));
    }

    @Test
    void generatedRefreshTokenPreservesSubjectWhenTypeClaimIsPresent() {
        JwtService jwtService = new JwtService(TEST_SECRET, 30, 43200);

        String token = jwtService.generateRefreshToken("learner@example.com");

        assertTrue(jwtService.isTokenValid(token));
        assertTrue(jwtService.isRefreshToken(token));
        assertFalse(jwtService.isAccessToken(token));
        assertEquals("learner@example.com", jwtService.extractSubject(token));
    }

    @Test
    void expiredRefreshTokenIsInvalid() {
        JwtService jwtService = new JwtService(TEST_SECRET, 30, -1);

        String token = jwtService.generateRefreshToken("learner@example.com");

        assertFalse(jwtService.isTokenValid(token));
    }
}
