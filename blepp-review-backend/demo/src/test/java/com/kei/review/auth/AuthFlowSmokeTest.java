package com.kei.review.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.kei.review.auth.dto.LoginRequest;
import com.kei.review.auth.dto.RegisterRequest;
import com.kei.review.users.UserService;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest
class AuthFlowSmokeTest {
    @Autowired
    private AuthService authService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserService userService;

    @Test
    void registerLoginAndProfileWorkTogether() {
        String email = "Auth-Smoke@Example.com";
        String normalizedEmail = "auth-smoke@example.com";
        String password = "strong-password";

        var registered = authService.register(new RegisterRequest(
            " " + email + " ",
            password,
            "Auth Smoke",
            null,
            2
        ));

        assertTrue(jwtService.isTokenValid(registered.accessToken()));
        assertEquals(normalizedEmail, jwtService.extractSubject(registered.accessToken()));

        var profileAfterRegister = userService.getProfile(registered.userId());
        assertEquals(normalizedEmail, profileAfterRegister.email());
        assertEquals("Auth Smoke", profileAfterRegister.fullName());
        assertEquals("TRIAL", profileAfterRegister.access().accessStatus().name());
        assertNotNull(profileAfterRegister.access().trialEndsAt());
        assertTrue(profileAfterRegister.hasStudyAccess());
        assertFalse(profileAfterRegister.hasAiAccess());

        var loggedIn = authService.login(new LoginRequest(" " + email + " ", password));

        assertTrue(jwtService.isTokenValid(loggedIn.accessToken()));
        assertEquals(normalizedEmail, jwtService.extractSubject(loggedIn.accessToken()));
        assertEquals(registered.userId(), loggedIn.userId());
    }

    @Test
    void refreshWithValidRefreshTokenIssuesNewValidTokens() {
        var registered = authService.register(new RegisterRequest(
            "refresh-" + UUID.randomUUID() + "@example.com",
            "strong-password",
            "Refresh User",
            null,
            2
        ));

        var refreshed = authService.refresh("Bearer " + registered.refreshToken());

        assertEquals(registered.userId(), refreshed.userId());
        assertTrue(jwtService.isTokenValid(refreshed.accessToken()));
        assertTrue(jwtService.isTokenValid(refreshed.refreshToken()));
    }

    @Test
    void refreshWithInvalidRefreshTokenIsUnauthorized() {
        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> authService.refresh("Bearer invalid-refresh-token")
        );

        assertEquals(401, exception.getStatusCode().value());
    }

    @Test
    void refreshWithAccessTokenIsUnauthorized() {
        var registered = authService.register(new RegisterRequest(
            "refresh-access-" + UUID.randomUUID() + "@example.com",
            "strong-password",
            "Refresh Access User",
            null,
            2
        ));

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> authService.refresh("Bearer " + registered.accessToken())
        );

        assertEquals(401, exception.getStatusCode().value());
    }
}
