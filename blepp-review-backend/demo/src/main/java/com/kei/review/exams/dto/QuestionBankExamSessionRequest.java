package com.kei.review.exams.dto;

import java.util.List;
import java.util.UUID;

public record QuestionBankExamSessionRequest(
    Integer questionCount,
    Integer durationMinutes,
    List<UUID> topicIds
) {
}
