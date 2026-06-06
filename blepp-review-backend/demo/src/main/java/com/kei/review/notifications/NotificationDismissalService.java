package com.kei.review.notifications;

import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.time.Clock;
import java.util.List;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
public class NotificationDismissalService {
    private final NotificationDismissalRepository notificationDismissalRepository;
    private final UserRepository userRepository;
    private final Clock clock;

    public NotificationDismissalService(
        NotificationDismissalRepository notificationDismissalRepository,
        UserRepository userRepository,
        Clock clock
    ) {
        this.notificationDismissalRepository = notificationDismissalRepository;
        this.userRepository = userRepository;
        this.clock = clock;
    }

    public List<String> listDismissedNotificationIds(UUID userId) {
        return notificationDismissalRepository.findByUserIdOrderByDismissedAtAsc(userId).stream()
            .map(NotificationDismissal::getNotificationKey)
            .toList();
    }

    public void dismiss(UUID userId, String notificationId) {
        if (notificationDismissalRepository.existsByUserIdAndNotificationKey(userId, notificationId)) {
            return;
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));
        NotificationDismissal dismissal = NotificationDismissal.builder()
            .user(user)
            .notificationKey(notificationId)
            .dismissedAt(clock.instant())
            .build();

        try {
            notificationDismissalRepository.saveAndFlush(dismissal);
        } catch (DataIntegrityViolationException ignored) {
            // A concurrent duplicate dismissal is already the desired final state.
        }
    }
}
