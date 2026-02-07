package com.kei.review.practice;

import com.kei.review.lessons.LessonCatalog;
import com.kei.review.lessons.LessonProgressRepository;
import com.kei.review.practice.dto.AnswerAttemptRequest;
import com.kei.review.practice.dto.CreatePracticeSessionRequest;
import com.kei.review.practice.dto.PracticeSessionResponse;
import com.kei.review.practice.dto.MistakeQuestionResponse;
import com.kei.review.questions.dto.QuestionResponse;
import com.kei.review.questions.Question;
import com.kei.review.questions.QuestionRepository;
import com.kei.review.topics.Topic;
import com.kei.review.topics.TopicRepository;
import com.kei.review.topics.UserTopic;
import com.kei.review.topics.UserTopicRepository;
import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PracticeServiceImpl implements PracticeService {
    private final PracticeSessionRepository practiceSessionRepository;
    private final AnswerAttemptRepository answerAttemptRepository;
    private final TopicRepository topicRepository;
    private final UserTopicRepository userTopicRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final LessonCatalog lessonCatalog;

    public PracticeServiceImpl(
        PracticeSessionRepository practiceSessionRepository,
        AnswerAttemptRepository answerAttemptRepository,
        TopicRepository topicRepository,
        UserTopicRepository userTopicRepository,
        UserRepository userRepository,
        QuestionRepository questionRepository,
        LessonProgressRepository lessonProgressRepository,
        LessonCatalog lessonCatalog
    ) {
        this.practiceSessionRepository = practiceSessionRepository;
        this.answerAttemptRepository = answerAttemptRepository;
        this.topicRepository = topicRepository;
        this.userTopicRepository = userTopicRepository;
        this.userRepository = userRepository;
        this.questionRepository = questionRepository;
        this.lessonProgressRepository = lessonProgressRepository;
        this.lessonCatalog = lessonCatalog;
    }

    @Override
    public PracticeSessionResponse startSession(UUID userId, CreatePracticeSessionRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));
        Topic topic = topicRepository.findById(request.topicId())
            .orElseThrow(() -> new IllegalStateException("Topic not found"));

        PracticeSession session = PracticeSession.builder()
            .user(user)
            .topic(topic)
            .difficulty(request.difficulty())
            .questionCount(request.questionCount())
            .createdAt(Instant.now())
            .build();

        PracticeSession saved = practiceSessionRepository.save(session);
        return new PracticeSessionResponse(
            saved.getId(),
            topic.getId(),
            topic.getName(),
            saved.getQuestionCount(),
            saved.getCreatedAt()
        );
    }

    @Override
    public void recordAttempt(UUID userId, AnswerAttemptRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));
        Question question = questionRepository.findById(request.questionId())
            .orElseThrow(() -> new IllegalStateException("Question not found"));
        PracticeSession session = practiceSessionRepository.findById(request.sessionId())
            .orElseThrow(() -> new IllegalStateException("Practice session not found"));

        if (!session.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Practice session not found");
        }

        if (!question.getOwner().getId().equals(userId)) {
            throw new IllegalStateException("Question not found");
        }

        boolean correct = request.selectedAnswerIndex() != null
            && request.selectedAnswerIndex().equals(question.getCorrectAnswerIndex());

        AnswerAttempt attempt = AnswerAttempt.builder()
            .user(user)
            .question(question)
            .practiceSession(session)
            .selectedAnswerIndex(request.selectedAnswerIndex())
            .correct(correct)
            .timeTakenSeconds(request.timeTakenSeconds())
            .createdAt(Instant.now())
            .build();

        answerAttemptRepository.save(attempt);

        Topic topic = question.getTopic();
        UserTopic userTopic = userTopicRepository.findByUserIdAndTopicId(userId, topic.getId())
            .orElseGet(() -> UserTopic.builder()
                .user(user)
                .topic(topic)
                .weak(false)
                .masteryPct(0)
                .build()
            );

        long totalAttempts = answerAttemptRepository.countByUserIdAndQuestionTopicId(userId, topic.getId());
        long correctAttempts = answerAttemptRepository.countByUserIdAndQuestionTopicIdAndCorrectTrue(userId, topic.getId());
        int practiceAccuracy = totalAttempts == 0 ? 0 : (int) Math.round((correctAttempts * 100.0) / totalAttempts);
        int totalLessons = lessonCatalog.getTotalLessons(topic.getSlug());
        long completedLessons = totalLessons == 0
            ? 0
            : lessonProgressRepository.countByUserIdAndTopicSlug(userId, topic.getSlug());
        int lessonCompletion = totalLessons == 0
            ? 0
            : (int) Math.round((completedLessons * 100.0) / totalLessons);
        int masteryPct = (int) Math.round(practiceAccuracy * 0.7 + lessonCompletion * 0.3);
        userTopic.setMasteryPct(masteryPct);
        userTopicRepository.save(userTopic);
    }

    @Override
    public List<UUID> listMistakeQuestionIds(UUID userId) {
        return answerAttemptRepository.findByUserIdAndCorrectFalse(userId)
            .stream()
            .map(attempt -> attempt.getQuestion().getId())
            .distinct()
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MistakeQuestionResponse> listMistakeQuestions(UUID userId) {
        List<AnswerAttempt> attempts =
            answerAttemptRepository.findByUserIdAndCorrectFalseOrderByCreatedAtDesc(userId);
        Map<UUID, MistakeQuestionResponse> latestByQuestion = new LinkedHashMap<>();
        for (AnswerAttempt attempt : attempts) {
            UUID questionId = attempt.getQuestion().getId();
            if (latestByQuestion.containsKey(questionId)) {
                continue;
            }
            Question question = attempt.getQuestion();
            String userAnswer = attempt.getSelectedAnswerIndex() != null &&
                attempt.getSelectedAnswerIndex() >= 0 &&
                attempt.getSelectedAnswerIndex() < question.getChoices().size()
                ? question.getChoices().get(attempt.getSelectedAnswerIndex())
                : null;
            String correctAnswer = question.getChoices().get(question.getCorrectAnswerIndex());
            latestByQuestion.put(
                questionId,
                new MistakeQuestionResponse(
                    questionId,
                    question.getTopic().getId(),
                    question.getTopic().getName(),
                    question.getText(),
                    userAnswer,
                    correctAnswer,
                    attempt.getCreatedAt()
                )
            );
        }
        return List.copyOf(latestByQuestion.values());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionResponse> listMistakeQuestionsByTopic(UUID userId, UUID topicId) {
        List<AnswerAttempt> attempts =
            answerAttemptRepository.findByUserIdAndCorrectFalseAndQuestionTopicIdOrderByCreatedAtDesc(userId, topicId);
        Map<UUID, Question> byQuestion = new LinkedHashMap<>();
        for (AnswerAttempt attempt : attempts) {
            Question question = attempt.getQuestion();
            byQuestion.putIfAbsent(question.getId(), question);
        }
        return byQuestion.values().stream()
            .map(this::toQuestionResponse)
            .toList();
    }

    @Override
    public PracticeSessionResponse startMistakeSession(UUID userId, UUID topicId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));
        Topic topic = topicRepository.findById(topicId)
            .orElseThrow(() -> new IllegalStateException("Topic not found"));

        int questionCount = answerAttemptRepository
            .findByUserIdAndCorrectFalseAndQuestionTopicIdOrderByCreatedAtDesc(userId, topicId)
            .stream()
            .map(attempt -> attempt.getQuestion().getId())
            .distinct()
            .toList()
            .size();

        PracticeSession session = PracticeSession.builder()
            .user(user)
            .topic(topic)
            .difficulty(null)
            .questionCount(questionCount)
            .createdAt(Instant.now())
            .build();

        PracticeSession saved = practiceSessionRepository.save(session);
        return new PracticeSessionResponse(
            saved.getId(),
            topic.getId(),
            topic.getName(),
            saved.getQuestionCount(),
            saved.getCreatedAt()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionResponse> listMistakeQuestionsAll(UUID userId) {
        List<AnswerAttempt> attempts =
            answerAttemptRepository.findByUserIdAndCorrectFalseOrderByCreatedAtDesc(userId);
        Map<UUID, Question> byQuestion = new LinkedHashMap<>();
        for (AnswerAttempt attempt : attempts) {
            Question question = attempt.getQuestion();
            byQuestion.putIfAbsent(question.getId(), question);
        }
        return byQuestion.values().stream()
            .map(this::toQuestionResponse)
            .toList();
    }

    @Override
    public PracticeSessionResponse startMistakeSessionAll(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));
        Topic topic = topicRepository.findBySlug("mistake-review")
            .orElseGet(() -> topicRepository.save(
                Topic.builder()
                    .name("Mistake Review")
                    .slug("mistake-review")
                    .color("gray")
                    .build()
            ));

        int questionCount = answerAttemptRepository
            .findByUserIdAndCorrectFalseOrderByCreatedAtDesc(userId)
            .stream()
            .map(attempt -> attempt.getQuestion().getId())
            .distinct()
            .toList()
            .size();

        PracticeSession session = PracticeSession.builder()
            .user(user)
            .topic(topic)
            .difficulty(null)
            .questionCount(questionCount)
            .createdAt(Instant.now())
            .build();

        PracticeSession saved = practiceSessionRepository.save(session);
        return new PracticeSessionResponse(
            saved.getId(),
            topic.getId(),
            topic.getName(),
            saved.getQuestionCount(),
            saved.getCreatedAt()
        );
    }

    private QuestionResponse toQuestionResponse(Question question) {
        return new QuestionResponse(
            question.getId(),
            question.getTopic().getId(),
            question.getTopic().getName(),
            question.getText(),
            question.getChoices(),
            question.getCorrectAnswerIndex(),
            question.getExplanation(),
            question.getDifficulty(),
            question.getSource(),
            question.getTags(),
            question.getCategory(),
            question.getCreatedAt()
        );
    }
}
