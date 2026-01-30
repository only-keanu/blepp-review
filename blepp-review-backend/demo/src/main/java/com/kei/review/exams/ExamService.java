package com.kei.review.exams;

import com.kei.review.exams.dto.ExamAnswerRequest;
import com.kei.review.exams.dto.ExamResponse;
import com.kei.review.exams.dto.ExamSessionResponse;
import com.kei.review.exams.dto.ExamSubmitResponse;
import java.util.List;
import java.util.UUID;

public interface ExamService {
    List<ExamResponse> listExams();
    ExamSessionResponse startSession(UUID userId, UUID examId);
    void recordAnswer(UUID userId, UUID sessionId, ExamAnswerRequest request);
    ExamSubmitResponse submit(UUID userId, UUID sessionId);
}
