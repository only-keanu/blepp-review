package com.kei.review.practice.dto;

import com.kei.review.questions.QuestionDifficulty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreatePracticeSessionRequest(
    @NotNull UUID topicId,
    QuestionDifficulty difficulty,
    @Min(1) @Max(100) Integer questionCount
) {
}
