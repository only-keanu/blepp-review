package com.kei.review.lessons;

import com.kei.review.lessons.dto.LessonProgressRequest;
import com.kei.review.lessons.dto.LessonProgressResponse;
import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class LessonProgressServiceImpl implements LessonProgressService {
    private final LessonProgressRepository lessonProgressRepository;
    private final UserRepository userRepository;

    public LessonProgressServiceImpl(
        LessonProgressRepository lessonProgressRepository,
        UserRepository userRepository
    ) {
        this.lessonProgressRepository = lessonProgressRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<LessonProgressResponse> listProgress(UUID userId, String topicSlug) {
        List<LessonProgress> progress = topicSlug == null || topicSlug.isBlank()
            ? lessonProgressRepository.findByUserId(userId)
            : lessonProgressRepository.findByUserIdAndTopicSlug(userId, topicSlug);

        return progress.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Override
    public LessonProgressResponse markComplete(UUID userId, LessonProgressRequest request) {
        if (request == null || request.lessonId() == null || request.lessonId().isBlank()) {
            throw new IllegalArgumentException("lessonId is required");
        }
        if (request.topicSlug() == null || request.topicSlug().isBlank()) {
            throw new IllegalArgumentException("topicSlug is required");
        }

        LessonProgress existing = lessonProgressRepository
            .findByUserIdAndLessonId(userId, request.lessonId())
            .orElse(null);
        if (existing != null) {
            return toResponse(existing);
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));

        LessonProgress created = LessonProgress.builder()
            .user(user)
            .topicSlug(request.topicSlug())
            .lessonId(request.lessonId())
            .completedAt(Instant.now())
            .build();

        LessonProgress saved = lessonProgressRepository.save(created);
        return toResponse(saved);
    }

    @Override
    public void deleteProgress(UUID userId, String lessonId) {
        if (lessonId == null || lessonId.isBlank()) {
            throw new IllegalArgumentException("lessonId is required");
        }
        lessonProgressRepository.findByUserIdAndLessonId(userId, lessonId)
            .ifPresent(lessonProgressRepository::delete);
    }

    private LessonProgressResponse toResponse(LessonProgress progress) {
        return new LessonProgressResponse(
            progress.getId(),
            progress.getTopicSlug(),
            progress.getLessonId(),
            progress.getCompletedAt()
        );
    }
}
