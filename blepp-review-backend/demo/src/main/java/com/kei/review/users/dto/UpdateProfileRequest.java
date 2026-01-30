package com.kei.review.users.dto;

import java.time.LocalDate;

public record UpdateProfileRequest(
    String fullName,
    LocalDate targetExamDate,
    Integer dailyStudyHours,
    String avatarUrl
) {
}
