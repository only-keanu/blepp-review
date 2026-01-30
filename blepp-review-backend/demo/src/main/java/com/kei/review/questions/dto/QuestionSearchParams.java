package com.kei.review.questions.dto;

import com.kei.review.questions.QuestionDifficulty;
import com.kei.review.questions.QuestionSource;
import java.util.List;
import java.util.UUID;

public record QuestionSearchParams(
    String query,
    UUID topicId,
    QuestionDifficulty difficulty,
    QuestionSource source,
    List<String> tags
) {
}
