package com.kei.review.practice;

import com.kei.review.practice.dto.AnswerAttemptRequest;
import com.kei.review.practice.dto.CreatePracticeSessionRequest;
import com.kei.review.practice.dto.PracticeSessionResponse;
import com.kei.review.practice.dto.MistakeQuestionResponse;
import com.kei.review.practice.dto.PracticeSessionQuestionResponse;
import com.kei.review.practice.dto.PracticeSessionResultResponse;
import com.kei.review.questions.dto.QuestionResponse;
import java.util.List;
import java.util.UUID;

public interface PracticeService {
    PracticeSessionResponse startSession(UUID userId, CreatePracticeSessionRequest request);
    List<PracticeSessionQuestionResponse> listSessionQuestions(UUID userId, UUID sessionId);
    void recordAttempt(UUID userId, AnswerAttemptRequest request);
    PracticeSessionResultResponse completeSession(UUID userId, UUID sessionId);
    List<UUID> listMistakeQuestionIds(UUID userId);
    List<MistakeQuestionResponse> listMistakeQuestions(UUID userId);
    List<QuestionResponse> listMistakeQuestionsByTopic(UUID userId, UUID topicId);
    PracticeSessionResponse startMistakeSession(UUID userId, UUID topicId);
    List<QuestionResponse> listMistakeQuestionsAll(UUID userId);
    PracticeSessionResponse startMistakeSessionAll(UUID userId);
}
