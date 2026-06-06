package com.kei.review.notifications;

import com.kei.review.auth.UserPrincipal;
import com.kei.review.notifications.dto.BulkNotificationDismissalRequest;
import com.kei.review.notifications.dto.NotificationDismissalListResponse;
import com.kei.review.notifications.dto.NotificationDismissalRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notification-dismissals")
public class NotificationDismissalController {
    private final NotificationDismissalService notificationDismissalService;

    public NotificationDismissalController(NotificationDismissalService notificationDismissalService) {
        this.notificationDismissalService = notificationDismissalService;
    }

    @GetMapping
    public ResponseEntity<NotificationDismissalListResponse> list(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(new NotificationDismissalListResponse(
            notificationDismissalService.listDismissedNotificationIds(principal.getId())
        ));
    }

    @PostMapping
    public ResponseEntity<Void> dismiss(
        @Valid @RequestBody NotificationDismissalRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        notificationDismissalService.dismiss(principal.getId(), request.notificationId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk")
    public ResponseEntity<Void> dismissBulk(
        @Valid @RequestBody BulkNotificationDismissalRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        notificationDismissalService.dismissAll(principal.getId(), request.notificationIds());
        return ResponseEntity.noContent().build();
    }
}
