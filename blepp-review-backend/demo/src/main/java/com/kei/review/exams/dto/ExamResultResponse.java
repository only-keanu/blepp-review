package com.kei.review.exams.dto;

import java.util.List;
import java.util.UUID;

public record ExamResultResponse(
    Integer score,
    Integer totalQuestions,
    Integer correctCount,
    Integer unansweredCount,
    Integer timeTakenSeconds,
    List<TopicScore> topicScores,
    List<QuestionReview> questions
) {
    public record TopicScore(String topicName, Integer correct, Integer total) {
    }

    public record QuestionReview(
        UUID questionId,
        String topicName,
        String text,
        List<String> choices,
        Integer selectedAnswerIndex,
        Integer correctAnswerIndex,
        Boolean correct,
        Boolean flagged,
        String explanation
    ) {
    }
}
