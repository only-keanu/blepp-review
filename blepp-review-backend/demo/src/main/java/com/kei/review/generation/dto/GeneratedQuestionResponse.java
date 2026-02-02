package com.kei.review.generation.dto;

import java.util.List;

public record GeneratedQuestionResponse(
    String text,
    List<String> choices,
    Integer correctAnswerIndex,
    String explanation,
    String difficulty,
    List<String> tags
) {
}
