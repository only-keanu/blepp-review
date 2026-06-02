package com.kei.review.users;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kei.review.users.dto.ChangePasswordRequest;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;

class UserServiceImplTest {
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private AccessService accessService;
    private UserServiceImpl service;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        accessService = mock(AccessService.class);
        service = new UserServiceImpl(userRepository, passwordEncoder, accessService);
    }

    @Test
    void changePasswordUpdatesHashWhenCurrentPasswordMatches() {
        UUID userId = UUID.randomUUID();
        User user = user(userId, "old-hash");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("current-password", "old-hash")).thenReturn(true);
        when(passwordEncoder.matches("new-password", "old-hash")).thenReturn(false);
        when(passwordEncoder.encode("new-password")).thenReturn("new-hash");

        service.changePassword(
            userId,
            new ChangePasswordRequest("current-password", "new-password", "new-password")
        );

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertEquals("new-hash", userCaptor.getValue().getPasswordHash());
        assertNotNull(userCaptor.getValue().getUpdatedAt());
    }

    @Test
    void changePasswordRejectsIncorrectCurrentPassword() {
        UUID userId = UUID.randomUUID();
        User user = user(userId, "old-hash");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "old-hash")).thenReturn(false);

        assertThrows(
            IllegalStateException.class,
            () -> service.changePassword(
                userId,
                new ChangePasswordRequest("wrong-password", "new-password", "new-password")
            )
        );

        verify(userRepository, never()).save(user);
    }

    @Test
    void changePasswordRejectsMismatchedConfirmation() {
        assertThrows(
            IllegalStateException.class,
            () -> service.changePassword(
                UUID.randomUUID(),
                new ChangePasswordRequest("current-password", "new-password", "different-password")
            )
        );

        verify(userRepository, never()).findById(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void changePasswordRejectsShortNewPassword() {
        assertThrows(
            IllegalStateException.class,
            () -> service.changePassword(
                UUID.randomUUID(),
                new ChangePasswordRequest("current-password", "short", "short")
            )
        );

        verify(userRepository, never()).findById(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void changePasswordRejectsSamePassword() {
        UUID userId = UUID.randomUUID();
        User user = user(userId, "old-hash");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("same-password", "old-hash")).thenReturn(true);

        assertThrows(
            IllegalStateException.class,
            () -> service.changePassword(
                userId,
                new ChangePasswordRequest("same-password", "same-password", "same-password")
            )
        );

        verify(passwordEncoder, never()).encode("same-password");
        verify(userRepository, never()).save(user);
    }

    @Test
    void changePasswordRejectsUnknownUser() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(
            IllegalStateException.class,
            () -> service.changePassword(
                userId,
                new ChangePasswordRequest("current-password", "new-password", "new-password")
            )
        );

        verify(passwordEncoder, never()).encode("new-password");
    }

    private User user(UUID userId, String passwordHash) {
        return User.builder()
            .id(userId)
            .email(userId + "@example.com")
            .passwordHash(passwordHash)
            .fullName("User")
            .build();
    }
}
