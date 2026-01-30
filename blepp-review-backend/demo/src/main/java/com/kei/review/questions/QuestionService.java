package com.kei.review.questions;

import com.kei.review.questions.dto.QuestionCreateRequest;
import com.kei.review.questions.dto.QuestionResponse;
import com.kei.review.questions.dto.QuestionSearchParams;
import com.kei.review.questions.dto.QuestionUpdateRequest;
import java.util.List;
import java.util.UUID;

public interface QuestionService {
    List<QuestionResponse> search(UUID userId, QuestionSearchParams params);
    QuestionResponse create(UUID userId, QuestionCreateRequest request);
    QuestionResponse update(UUID userId, UUID questionId, QuestionUpdateRequest request);
    void delete(UUID userId, UUID questionId);
    List<QuestionResponse> bulkCreate(UUID userId, List<QuestionCreateRequest> requests);
}
