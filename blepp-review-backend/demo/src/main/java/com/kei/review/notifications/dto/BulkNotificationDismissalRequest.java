package com.kei.review.notifications.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record BulkNotificationDismissalRequest(
    @NotEmpty
    @Size(max = 100)
    List<@NotBlank @Size(max = 255) String> notificationIds
) {
}
