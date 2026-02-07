package com.kei.review.exams;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamSessionQuestionRepository extends JpaRepository<ExamSessionQuestion, UUID> {
    List<ExamSessionQuestion> findByExamSessionIdOrderByOrderIndexAsc(UUID examSessionId);
    Optional<ExamSessionQuestion> findByExamSessionIdAndQuestionId(UUID examSessionId, UUID questionId);
}
