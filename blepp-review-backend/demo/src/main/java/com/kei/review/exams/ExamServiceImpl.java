package com.kei.review.exams;

import com.kei.review.exams.dto.ExamAnswerRequest;
import com.kei.review.exams.dto.ExamResponse;
import com.kei.review.exams.dto.ExamSessionResponse;
import com.kei.review.exams.dto.ExamSubmitResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class ExamServiceImpl implements ExamService {
    @Override
    public List<ExamResponse> listExams() {
        throw new UnsupportedOperationException("Not implemented");
    }

    @Override
    public ExamSessionResponse startSession(UUID userId, UUID examId) {
        throw new UnsupportedOperationException("Not implemented");
    }

    @Override
    public void recordAnswer(UUID userId, UUID sessionId, ExamAnswerRequest request) {
        throw new UnsupportedOperationException("Not implemented");
    }

    @Override
    public ExamSubmitResponse submit(UUID userId, UUID sessionId) {
        throw new UnsupportedOperationException("Not implemented");
    }
}
