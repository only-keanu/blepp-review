package com.kei.review.lessons;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, UUID> {
    List<LessonProgress> findByUserId(UUID userId);
    List<LessonProgress> findByUserIdAndTopicSlug(UUID userId, String topicSlug);
    Optional<LessonProgress> findByUserIdAndLessonId(UUID userId, String lessonId);
}
