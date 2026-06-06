package com.kei.review.notifications.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NotificationDismissalRequest(
    @NotBlank
    @Size(max = 255)
    String notificationId
) {
}
