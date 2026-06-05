package com.kei.review.exams;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamAnswerRepository extends JpaRepository<ExamAnswer, UUID> {
    List<ExamAnswer> findByExamSessionId(UUID examSessionId);
    Optional<ExamAnswer> findByExamSessionIdAndQuestionId(UUID examSessionId, UUID questionId);
    long countByExamSessionId(UUID examSessionId);
}
