package com.kei.review.admin.dto;

import com.kei.review.users.UserAccessStatus;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record AdminAccessUpdateRequest(
    @NotNull UserAccessStatus accessStatus,
    Instant paidUntil,
    String paymentReference,
    String accessNotes
) {
}
