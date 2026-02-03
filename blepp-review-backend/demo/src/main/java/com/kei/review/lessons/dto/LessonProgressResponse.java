package com.kei.review.lessons.dto;

import java.time.Instant;
import java.util.UUID;

public record LessonProgressResponse(
    UUID id,
    String topicSlug,
    String lessonId,
    Instant completedAt
) {}
