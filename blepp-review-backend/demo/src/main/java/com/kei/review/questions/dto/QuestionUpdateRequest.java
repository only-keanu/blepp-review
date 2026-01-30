package com.kei.review.questions.dto;

import com.kei.review.questions.QuestionDifficulty;
import com.kei.review.questions.QuestionSource;
import java.util.List;
import java.util.UUID;

public record QuestionUpdateRequest(
    UUID topicId,
    String text,
    List<String> choices,
    Integer correctAnswerIndex,
    String explanation,
    QuestionDifficulty difficulty,
    QuestionSource source,
    List<String> tags,
    String category
) {
}
