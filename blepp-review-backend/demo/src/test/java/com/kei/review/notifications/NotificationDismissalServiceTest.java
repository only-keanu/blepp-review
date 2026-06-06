package com.kei.review.notifications;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.dao.DataIntegrityViolationException;

class NotificationDismissalServiceTest {
    private static final Instant NOW = Instant.parse("2026-06-06T00:00:00Z");

    private NotificationDismissalRepository notificationDismissalRepository;
    private UserRepository userRepository;
    private NotificationDismissalService service;

    @BeforeEach
    void setUp() {
        notificationDismissalRepository = mock(NotificationDismissalRepository.class);
        userRepository = mock(UserRepository.class);
        service = new NotificationDismissalService(
            notificationDismissalRepository,
            userRepository,
            Clock.fixed(NOW, ZoneOffset.UTC)
        );
    }

    @Test
    void listsOnlyRepositoryResultsForRequestedUser() {
        UUID userId = UUID.randomUUID();
        when(notificationDismissalRepository.findByUserIdOrderByDismissedAtAsc(userId))
            .thenReturn(List.of(
                dismissal("flashcards-due-3"),
                dismissal("exam-session-123")
            ));

        assertEquals(
            List.of("flashcards-due-3", "exam-session-123"),
            service.listDismissedNotificationIds(userId)
        );
    }

    @Test
    void createsDismissalWithAuthenticatedUserAndCurrentTime() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).build();
        when(notificationDismissalRepository.existsByUserIdAndNotificationKey(userId, "flashcards-due-3"))
            .thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        service.dismiss(userId, "flashcards-due-3");

        ArgumentCaptor<NotificationDismissal> captor = ArgumentCaptor.forClass(NotificationDismissal.class);
        verify(notificationDismissalRepository).saveAndFlush(captor.capture());
        assertEquals(user, captor.getValue().getUser());
        assertEquals("flashcards-due-3", captor.getValue().getNotificationKey());
        assertEquals(NOW, captor.getValue().getDismissedAt());
    }

    @Test
    void duplicateDismissalReturnsWithoutWriting() {
        UUID userId = UUID.randomUUID();
        when(notificationDismissalRepository.existsByUserIdAndNotificationKey(userId, "access-expired"))
            .thenReturn(true);

        service.dismiss(userId, "access-expired");

        verify(userRepository, never()).findById(userId);
        verify(notificationDismissalRepository, never()).saveAndFlush(
            org.mockito.ArgumentMatchers.any(NotificationDismissal.class)
        );
    }

    @Test
    void concurrentDuplicateConstraintViolationIsIdempotent() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).build();
        when(notificationDismissalRepository.existsByUserIdAndNotificationKey(userId, "access-expired"))
            .thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(notificationDismissalRepository.saveAndFlush(
            org.mockito.ArgumentMatchers.any(NotificationDismissal.class)
        )).thenThrow(new DataIntegrityViolationException("duplicate"));

        assertDoesNotThrow(() -> service.dismiss(userId, "access-expired"));
    }

    private NotificationDismissal dismissal(String notificationKey) {
        return NotificationDismissal.builder()
            .notificationKey(notificationKey)
            .dismissedAt(NOW)
            .build();
    }
}
