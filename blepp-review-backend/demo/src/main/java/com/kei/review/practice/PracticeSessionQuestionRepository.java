package com.kei.review.practice;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PracticeSessionQuestionRepository extends JpaRepository<PracticeSessionQuestion, UUID> {
    List<PracticeSessionQuestion> findByPracticeSessionIdOrderByOrderIndexAsc(UUID practiceSessionId);
    Optional<PracticeSessionQuestion> findByPracticeSessionIdAndQuestionId(UUID practiceSessionId, UUID questionId);
}
