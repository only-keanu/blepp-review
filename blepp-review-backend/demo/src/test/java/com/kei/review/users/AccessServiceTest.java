package com.kei.review.users;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class AccessServiceTest {
    private static final Instant NOW = Instant.parse("2026-06-02T00:00:00Z");

    @Test
    void trialUsersHaveStudyAccessButNoAiAccess() {
        AccessService service = service("");
        User user = baseUser();
        user.setAccessStatus(UserAccessStatus.TRIAL);
        user.setTrialEndsAt(NOW.plusSeconds(3600));

        assertTrue(service.hasStudyAccess(user));
        assertFalse(service.hasAiAccess(user));
    }

    @Test
    void paidUsersHaveStudyAndAiAccessUntilPaidExpiry() {
        AccessService service = service("");
        User user = baseUser();
        user.setAccessStatus(UserAccessStatus.PAID);
        user.setPaidUntil(NOW.plusSeconds(3600));

        assertTrue(service.hasStudyAccess(user));
        assertTrue(service.hasAiAccess(user));
    }

    @Test
    void expiredTrialHasNoStudyAccess() {
        AccessService service = service("");
        User user = baseUser();
        user.setAccessStatus(UserAccessStatus.TRIAL);
        user.setTrialEndsAt(NOW.minusSeconds(1));

        assertFalse(service.hasStudyAccess(user));
        assertFalse(service.hasAiAccess(user));
    }

    @Test
    void configuredAdminEmailBypassesAccessChecks() {
        AccessService service = service("admin@example.com");
        User user = baseUser();
        user.setEmail("Admin@Example.com");
        user.setAccessStatus(UserAccessStatus.EXPIRED);

        assertTrue(service.isAdmin(user));
        assertTrue(service.hasStudyAccess(user));
        assertTrue(service.hasAiAccess(user));
        assertTrue(service.toAccessResponse(user).admin());
    }

    private AccessService service(String adminEmails) {
        return new AccessService(
            null,
            Clock.fixed(NOW, ZoneOffset.UTC),
            adminEmails
        );
    }

    private User baseUser() {
        return User.builder()
            .email("user@example.com")
            .passwordHash("hash")
            .fullName("User")
            .build();
    }
}
