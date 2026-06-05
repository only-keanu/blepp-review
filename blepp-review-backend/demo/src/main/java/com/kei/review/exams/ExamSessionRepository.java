package com.kei.review.exams;

import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamSessionRepository extends JpaRepository<ExamSession, UUID> {
    List<ExamSession> findByUserId(UUID userId);

    @EntityGraph(attributePaths = "mockExam")
    List<ExamSession> findByUserIdOrderByStartedAtDesc(UUID userId, Pageable pageable);
}
