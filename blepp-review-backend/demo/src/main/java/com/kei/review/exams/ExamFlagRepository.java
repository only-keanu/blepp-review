package com.kei.review.exams;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExamFlagRepository extends JpaRepository<ExamFlag, UUID> {
    Optional<ExamFlag> findByExamSessionIdAndQuestionId(UUID examSessionId, UUID questionId);
    List<ExamFlag> findByExamSessionId(UUID examSessionId);
}
