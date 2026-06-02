package com.kei.review.practice.dto;

import java.util.List;
import java.util.UUID;

public record PracticeSessionResultResponse(
    UUID sessionId,
    Integer score,
    Integer totalQuestions,
    Integer answeredCount,
    Integer correctCount,
    Integer unansweredCount,
    List<QuestionReview> questions
) {
    public record QuestionReview(
        UUID questionId,
        String topicName,
        String text,
        List<String> choices,
        Integer selectedAnswerIndex,
        Integer correctAnswerIndex,
        Boolean correct,
        String explanation
    ) {
    }
}
