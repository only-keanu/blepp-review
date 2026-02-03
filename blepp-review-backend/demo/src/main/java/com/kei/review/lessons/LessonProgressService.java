package com.kei.review.lessons;

import com.kei.review.lessons.dto.LessonProgressRequest;
import com.kei.review.lessons.dto.LessonProgressResponse;
import java.util.List;
import java.util.UUID;

public interface LessonProgressService {
    List<LessonProgressResponse> listProgress(UUID userId, String topicSlug);
    LessonProgressResponse markComplete(UUID userId, LessonProgressRequest request);
    void deleteProgress(UUID userId, String lessonId);
}
