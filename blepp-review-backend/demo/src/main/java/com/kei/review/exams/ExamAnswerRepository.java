package com.kei.review.exams;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ExamAnswerRepository extends JpaRepository<ExamAnswer, UUID> {
    List<ExamAnswer> findByExamSessionId(UUID examSessionId);
    Optional<ExamAnswer> findByExamSessionIdAndQuestionId(UUID examSessionId, UUID questionId);
}
