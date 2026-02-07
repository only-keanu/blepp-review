package com.kei.review.exams.dto;

import java.util.List;

public record ExamResultResponse(
    Integer score,
    Integer totalQuestions,
    Integer correctCount,
    List<TopicScore> topicScores
) {
    public record TopicScore(String topicName, Integer correct, Integer total) {
    }
}
