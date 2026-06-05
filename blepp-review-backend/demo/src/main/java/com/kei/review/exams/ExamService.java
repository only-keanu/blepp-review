package com.kei.review.exams;

import com.kei.review.exams.dto.ExamAnswerRequest;
import com.kei.review.exams.dto.ExamFlagResponse;
import com.kei.review.exams.dto.ExamResponse;
import com.kei.review.exams.dto.ExamResultResponse;
import com.kei.review.exams.dto.ExamSessionQuestionResponse;
import com.kei.review.exams.dto.ExamSessionResponse;
import com.kei.review.exams.dto.ExamSessionSummaryResponse;
import com.kei.review.exams.dto.ExamSubmitResponse;
import com.kei.review.exams.dto.QuestionBankExamSessionRequest;
import java.util.List;
import java.util.UUID;

public interface ExamService {
    List<ExamResponse> listExams();
    List<ExamSessionSummaryResponse> listRecentSessions(UUID userId, Integer limit);
    ExamSessionResponse getSession(UUID userId, UUID sessionId);
    ExamSessionResponse startSession(UUID userId, UUID examId);
    ExamSessionResponse startQuestionBankSession(UUID userId, QuestionBankExamSessionRequest request);
    void recordAnswer(UUID userId, UUID sessionId, ExamAnswerRequest request);
    ExamSubmitResponse submit(UUID userId, UUID sessionId);
    List<ExamFlagResponse> listFlags(UUID userId, UUID sessionId);
    List<ExamSessionQuestionResponse> listSessionQuestions(UUID userId, UUID sessionId);
    ExamResultResponse results(UUID userId, UUID sessionId);
}
