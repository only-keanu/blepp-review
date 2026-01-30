package com.kei.review.questions.dto;

import com.kei.review.questions.QuestionDifficulty;
import com.kei.review.questions.QuestionSource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record QuestionCreateRequest(
    @NotNull UUID topicId,
    @NotBlank String text,
    @NotEmpty List<String> choices,
    @NotNull Integer correctAnswerIndex,
    String explanation,
    @NotNull QuestionDifficulty difficulty,
    @NotNull QuestionSource source,
    List<String> tags,
    String category
) {
}
