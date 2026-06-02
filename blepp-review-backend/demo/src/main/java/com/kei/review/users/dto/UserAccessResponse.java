package com.kei.review.users.dto;

import com.kei.review.users.UserAccessStatus;
import com.kei.review.users.UserRole;
import java.time.Instant;

public record UserAccessResponse(
    UserRole role,
    UserAccessStatus accessStatus,
    Instant trialEndsAt,
    Instant paidUntil,
    Instant accessUpdatedAt,
    String accessNotes,
    String paymentReference,
    boolean hasStudyAccess,
    boolean hasAiAccess,
    boolean admin
) {
}
