package com.kei.review.users.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record UpdateProfileRequest(
    @Size(max = 120) String fullName,
    LocalDate targetExamDate,
    @Min(1) @Max(24) Integer dailyStudyHours,
    String avatarUrl
) {
}
