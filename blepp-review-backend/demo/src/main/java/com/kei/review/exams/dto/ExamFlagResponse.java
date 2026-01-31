package com.kei.review.exams.dto;

import java.util.UUID;

public record ExamFlagResponse(UUID questionId, boolean flagged) {
}
