package com.kei.review.admin;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.kei.review.admin.dto.AdminAccessUpdateRequest;
import com.kei.review.users.AccessService;
import com.kei.review.users.User;
import com.kei.review.users.UserAccessStatus;
import com.kei.review.users.UserRepository;
import com.kei.review.users.UserRole;
import com.kei.review.users.dto.UserAccessResponse;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AdminUserServiceTest {
    private static final Instant NOW = Instant.parse("2026-06-02T00:00:00Z");

    private UserRepository userRepository;
    private AdminUserService service;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        AccessService accessService = mock(AccessService.class);
        when(accessService.toAccessResponse(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            return new UserAccessResponse(
                UserRole.USER,
                user.getAccessStatus(),
                user.getTrialEndsAt(),
                user.getPaidUntil(),
                user.getAccessUpdatedAt(),
                user.getAccessNotes(),
                user.getPaymentReference(),
                user.getAccessStatus() != UserAccessStatus.EXPIRED,
                user.getAccessStatus() == UserAccessStatus.PAID,
                false
            );
        });
        service = new AdminUserService(
            userRepository,
            accessService,
            Clock.fixed(NOW, ZoneOffset.UTC)
        );
    }

    @Test
    void grantPaidAccessDefaultsToThirtyDaysWhenExpiryIsNotProvided() {
        UUID userId = UUID.randomUUID();
        User user = user(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        var response = service.updateAccess(
            userId,
            new AdminAccessUpdateRequest(UserAccessStatus.PAID, null, "GCASH-123", "Verified on Facebook")
        );

        assertEquals(UserAccessStatus.PAID, user.getAccessStatus());
        assertEquals(NOW.plusSeconds(30L * 24 * 60 * 60), user.getPaidUntil());
        assertEquals("GCASH-123", user.getPaymentReference());
        assertEquals("Verified on Facebook", user.getAccessNotes());
        assertEquals(NOW, user.getAccessUpdatedAt());
        assertEquals(UserAccessStatus.PAID, response.access().accessStatus());
    }

    @Test
    void revokeAccessClearsPaidUntilAndMarksExpired() {
        UUID userId = UUID.randomUUID();
        User user = user(userId);
        user.setAccessStatus(UserAccessStatus.PAID);
        user.setPaidUntil(NOW.plusSeconds(3600));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        service.updateAccess(
            userId,
            new AdminAccessUpdateRequest(UserAccessStatus.EXPIRED, null, "", "")
        );

        assertEquals(UserAccessStatus.EXPIRED, user.getAccessStatus());
        assertNull(user.getPaidUntil());
        assertNull(user.getPaymentReference());
        assertNull(user.getAccessNotes());
        assertEquals(NOW, user.getAccessUpdatedAt());
    }

    private User user(UUID userId) {
        return User.builder()
            .id(userId)
            .email("user@example.com")
            .passwordHash("hash")
            .fullName("User")
            .accessStatus(UserAccessStatus.TRIAL)
            .build();
    }
}
