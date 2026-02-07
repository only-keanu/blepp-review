package com.kei.review.users.dto;

import java.time.LocalDate;
import java.util.UUID;

public record UserProfileResponse(
    UUID id,
    String email,
    String fullName,
    LocalDate targetExamDate,
    Integer dailyStudyHours,
    String avatarUrl
) {
}
