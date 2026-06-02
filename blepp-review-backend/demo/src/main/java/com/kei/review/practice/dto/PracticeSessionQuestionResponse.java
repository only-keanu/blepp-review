package com.kei.review.practice.dto;

import com.kei.review.questions.QuestionDifficulty;
import java.util.List;
import java.util.UUID;

public record PracticeSessionQuestionResponse(
    UUID questionId,
    UUID topicId,
    String topicName,
    String text,
    List<String> choices,
    Integer correctAnswerIndex,
    String explanation,
    QuestionDifficulty difficulty
) {
}
