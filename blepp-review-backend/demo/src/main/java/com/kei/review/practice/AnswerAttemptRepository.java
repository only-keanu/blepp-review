package com.kei.review.practice;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnswerAttemptRepository extends JpaRepository<AnswerAttempt, UUID> {
    List<AnswerAttempt> findByUserIdAndCorrectFalse(UUID userId);
}
