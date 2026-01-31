package com.kei.review.exams.dto;

import java.util.List;
import java.util.UUID;

public record ExamSessionQuestionResponse(
    UUID questionId,
    String text,
    List<String> choices
) {
}
