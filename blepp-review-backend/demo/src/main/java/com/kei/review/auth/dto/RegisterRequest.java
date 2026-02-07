package com.kei.review.auth.dto;

import java.time.LocalDate;

public record RegisterRequest(
    String email,
    String password,
    String fullName,
    LocalDate targetExamDate,
    Integer dailyStudyHours
) {
}
