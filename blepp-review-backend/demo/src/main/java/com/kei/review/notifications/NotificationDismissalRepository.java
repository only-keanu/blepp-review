package com.kei.review.notifications;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationDismissalRepository extends JpaRepository<NotificationDismissal, UUID> {
    List<NotificationDismissal> findByUserIdOrderByDismissedAtAsc(UUID userId);
    boolean existsByUserIdAndNotificationKey(UUID userId, String notificationKey);
}
