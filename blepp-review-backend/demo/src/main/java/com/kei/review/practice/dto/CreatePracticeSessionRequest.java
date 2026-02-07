package com.kei.review.practice.dto;

import com.kei.review.questions.QuestionDifficulty;
import java.util.UUID;

public record CreatePracticeSessionRequest(
    UUID topicId,
    QuestionDifficulty difficulty,
    Integer questionCount
) {
}
