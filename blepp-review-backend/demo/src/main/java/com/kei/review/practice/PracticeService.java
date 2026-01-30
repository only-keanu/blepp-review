package com.kei.review.practice;

import com.kei.review.practice.dto.AnswerAttemptRequest;
import com.kei.review.practice.dto.CreatePracticeSessionRequest;
import com.kei.review.practice.dto.PracticeSessionResponse;
import java.util.List;
import java.util.UUID;

public interface PracticeService {
    PracticeSessionResponse startSession(UUID userId, CreatePracticeSessionRequest request);
    void recordAttempt(UUID userId, AnswerAttemptRequest request);
    List<UUID> listMistakeQuestionIds(UUID userId);
}
