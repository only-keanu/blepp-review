package com.kei.review.admin.dto;

import com.kei.review.users.dto.UserAccessResponse;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record AdminUserResponse(
    UUID id,
    String email,
    String fullName,
    LocalDate targetExamDate,
    Integer dailyStudyHours,
    Instant createdAt,
    Instant updatedAt,
    UserAccessResponse access
) {
}
