package com.kei.review.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.kei.review.auth.dto.LoginRequest;
import com.kei.review.auth.dto.RegisterRequest;
import com.kei.review.users.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

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
        String email = "auth-smoke@example.com";
        String password = "strong-password";

        var registered = authService.register(new RegisterRequest(
            email,
            password,
            "Auth Smoke",
            null,
            2
        ));

        assertTrue(jwtService.isTokenValid(registered.accessToken()));
        assertEquals(email, jwtService.extractSubject(registered.accessToken()));

        var profileAfterRegister = userService.getProfile(registered.userId());
        assertEquals(email, profileAfterRegister.email());
        assertEquals("Auth Smoke", profileAfterRegister.fullName());
        assertEquals("TRIAL", profileAfterRegister.access().accessStatus().name());
        assertNotNull(profileAfterRegister.access().trialEndsAt());
        assertTrue(profileAfterRegister.hasStudyAccess());
        assertFalse(profileAfterRegister.hasAiAccess());

        var loggedIn = authService.login(new LoginRequest(email, password));

        assertTrue(jwtService.isTokenValid(loggedIn.accessToken()));
        assertEquals(email, jwtService.extractSubject(loggedIn.accessToken()));
        assertEquals(registered.userId(), loggedIn.userId());
    }
}
