package com.kei.review.practice;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;

public interface AnswerAttemptRepository extends JpaRepository<AnswerAttempt, UUID> {
    List<AnswerAttempt> findByUserId(UUID userId);
    List<AnswerAttempt> findByUserIdAndCorrectFalse(UUID userId);
    long countByUserId(UUID userId);
    long countByUserIdAndCorrectTrue(UUID userId);
    List<AnswerAttempt> findByUserIdAndCreatedAtAfter(UUID userId, Instant after);
}
