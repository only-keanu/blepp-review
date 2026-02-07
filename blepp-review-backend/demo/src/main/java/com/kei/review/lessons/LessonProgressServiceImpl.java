package com.kei.review.lessons;

import com.kei.review.lessons.dto.LessonProgressRequest;
import com.kei.review.lessons.dto.LessonProgressResponse;
import com.kei.review.practice.AnswerAttemptRepository;
import com.kei.review.topics.Topic;
import com.kei.review.topics.TopicRepository;
import com.kei.review.topics.UserTopic;
import com.kei.review.topics.UserTopicRepository;
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
    private final TopicRepository topicRepository;
    private final UserTopicRepository userTopicRepository;
    private final AnswerAttemptRepository answerAttemptRepository;
    private final LessonCatalog lessonCatalog;

    public LessonProgressServiceImpl(
        LessonProgressRepository lessonProgressRepository,
        UserRepository userRepository,
        TopicRepository topicRepository,
        UserTopicRepository userTopicRepository,
        AnswerAttemptRepository answerAttemptRepository,
        LessonCatalog lessonCatalog
    ) {
        this.lessonProgressRepository = lessonProgressRepository;
        this.userRepository = userRepository;
        this.topicRepository = topicRepository;
        this.userTopicRepository = userTopicRepository;
        this.answerAttemptRepository = answerAttemptRepository;
        this.lessonCatalog = lessonCatalog;
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
        updateMasteryFromLesson(userId, request.topicSlug());
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

    private void updateMasteryFromLesson(UUID userId, String topicSlug) {
        if (topicSlug == null || topicSlug.isBlank()) {
            return;
        }
        Topic topic = topicRepository.findBySlug(topicSlug)
            .orElse(null);
        if (topic == null) {
            return;
        }

        long totalAttempts = answerAttemptRepository.countByUserIdAndQuestionTopicId(userId, topic.getId());
        long correctAttempts = answerAttemptRepository.countByUserIdAndQuestionTopicIdAndCorrectTrue(userId, topic.getId());
        int practiceAccuracy = totalAttempts == 0 ? 0 : (int) Math.round((correctAttempts * 100.0) / totalAttempts);

        int totalLessons = lessonCatalog.getTotalLessons(topicSlug);
        long completedLessons = totalLessons == 0
            ? 0
            : lessonProgressRepository.countByUserIdAndTopicSlug(userId, topicSlug);
        int lessonCompletion = totalLessons == 0
            ? 0
            : (int) Math.round((completedLessons * 100.0) / totalLessons);

        int masteryPct = (int) Math.round(practiceAccuracy * 0.7 + lessonCompletion * 0.3);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));
        UserTopic userTopic = userTopicRepository.findByUserIdAndTopicId(userId, topic.getId())
            .orElseGet(() -> UserTopic.builder()
                .user(user)
                .topic(topic)
                .weak(false)
                .masteryPct(0)
                .build()
            );
        userTopic.setMasteryPct(masteryPct);
        userTopicRepository.save(userTopic);
    }
}
