package com.kei.review.practice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kei.review.config.SeedData;
import com.kei.review.lessons.LessonCatalog;
import com.kei.review.lessons.LessonProgressRepository;
import com.kei.review.practice.dto.AnswerAttemptRequest;
import com.kei.review.practice.dto.CreatePracticeSessionRequest;
import com.kei.review.practice.dto.PracticeSessionResponse;
import com.kei.review.questions.Question;
import com.kei.review.questions.QuestionDifficulty;
import com.kei.review.questions.QuestionRepository;
import com.kei.review.questions.QuestionSource;
import com.kei.review.topics.Topic;
import com.kei.review.topics.TopicRepository;
import com.kei.review.topics.UserTopicRepository;
import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class PracticeServiceImplTest {
    private AnswerAttemptRepository answerAttemptRepository;
    private PracticeSessionRepository practiceSessionRepository;
    private TopicRepository topicRepository;
    private UserRepository userRepository;
    private QuestionRepository questionRepository;
    private PracticeSessionQuestionRepository practiceSessionQuestionRepository;
    private PracticeServiceImpl service;

    @BeforeEach
    void setUp() {
        answerAttemptRepository = mock(AnswerAttemptRepository.class);
        practiceSessionRepository = mock(PracticeSessionRepository.class);
        topicRepository = mock(TopicRepository.class);
        userRepository = mock(UserRepository.class);
        questionRepository = mock(QuestionRepository.class);
        practiceSessionQuestionRepository = mock(PracticeSessionQuestionRepository.class);
        service = new PracticeServiceImpl(
            practiceSessionRepository,
            answerAttemptRepository,
            topicRepository,
            mock(UserTopicRepository.class),
            userRepository,
            questionRepository,
            practiceSessionQuestionRepository,
            mock(LessonProgressRepository.class),
            mock(LessonCatalog.class)
        );
    }

    @Test
    void startSessionUsesSeedFallbackQuestionsWhenUserHasNoPersonalQuestions() {
        UUID userId = UUID.randomUUID();
        Topic topic = topic(UUID.randomUUID());
        User user = user(userId, "user@example.com");
        Question seedQuestion = question(UUID.randomUUID(), user(UUID.randomUUID(), SeedData.SYSTEM_USER_EMAIL), topic);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(topicRepository.findById(topic.getId())).thenReturn(Optional.of(topic));
        when(questionRepository.findByOwnerEmailAndTopicId(SeedData.SYSTEM_USER_EMAIL, topic.getId()))
            .thenReturn(List.of(seedQuestion));
        when(questionRepository.findByOwnerIdAndTopicId(userId, topic.getId())).thenReturn(List.of());
        when(practiceSessionRepository.save(any(PracticeSession.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        PracticeSessionResponse response = service.startSession(
            userId,
            new CreatePracticeSessionRequest(topic.getId(), null, 10)
        );

        ArgumentCaptor<List<PracticeSessionQuestion>> captor = practiceSessionQuestionListCaptor();
        verify(practiceSessionQuestionRepository).saveAll(captor.capture());
        PracticeSessionQuestion assigned = (PracticeSessionQuestion) captor.getValue().get(0);
        assertEquals(1, response.questionCount());
        assertEquals(seedQuestion.getId(), assigned.getQuestion().getId());
    }

    @Test
    void startSessionUsesSeedAndPersonalQuestionsTogether() {
        UUID userId = UUID.randomUUID();
        Topic topic = topic(UUID.randomUUID());
        User user = user(userId, "user@example.com");
        Question seedQuestion = question(UUID.randomUUID(), user(UUID.randomUUID(), SeedData.SYSTEM_USER_EMAIL), topic);
        Question personalQuestion = question(UUID.randomUUID(), user, topic);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(topicRepository.findById(topic.getId())).thenReturn(Optional.of(topic));
        when(questionRepository.findByOwnerEmailAndTopicId(SeedData.SYSTEM_USER_EMAIL, topic.getId()))
            .thenReturn(List.of(seedQuestion));
        when(questionRepository.findByOwnerIdAndTopicId(userId, topic.getId())).thenReturn(List.of(personalQuestion));
        when(practiceSessionRepository.save(any(PracticeSession.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        PracticeSessionResponse response = service.startSession(
            userId,
            new CreatePracticeSessionRequest(topic.getId(), null, 10)
        );

        ArgumentCaptor<List<PracticeSessionQuestion>> captor = practiceSessionQuestionListCaptor();
        verify(practiceSessionQuestionRepository).saveAll(captor.capture());
        List<UUID> assignedQuestionIds = captor.getValue().stream()
            .map(item -> item.getQuestion().getId())
            .toList();
        assertEquals(2, response.questionCount());
        assertTrue(assignedQuestionIds.contains(seedQuestion.getId()));
        assertTrue(assignedQuestionIds.contains(personalQuestion.getId()));
    }

    @Test
    void startSessionAppliesDifficultyFilterToSelectedTopicPool() {
        UUID userId = UUID.randomUUID();
        Topic topic = topic(UUID.randomUUID());
        User user = user(userId, "user@example.com");
        Question easy = question(UUID.randomUUID(), user, topic);
        easy.setDifficulty(QuestionDifficulty.EASY);
        Question hard = question(UUID.randomUUID(), user, topic);
        hard.setDifficulty(QuestionDifficulty.HARD);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(topicRepository.findById(topic.getId())).thenReturn(Optional.of(topic));
        when(questionRepository.findByOwnerEmailAndTopicId(SeedData.SYSTEM_USER_EMAIL, topic.getId()))
            .thenReturn(List.of());
        when(questionRepository.findByOwnerIdAndTopicId(userId, topic.getId())).thenReturn(List.of(easy, hard));
        when(practiceSessionRepository.save(any(PracticeSession.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        PracticeSessionResponse response = service.startSession(
            userId,
            new CreatePracticeSessionRequest(topic.getId(), QuestionDifficulty.HARD, 10)
        );

        ArgumentCaptor<List<PracticeSessionQuestion>> captor = practiceSessionQuestionListCaptor();
        verify(practiceSessionQuestionRepository).saveAll(captor.capture());
        PracticeSessionQuestion assigned = (PracticeSessionQuestion) captor.getValue().get(0);
        assertEquals(1, response.questionCount());
        assertEquals(hard.getId(), assigned.getQuestion().getId());
    }

    @Test
    void recordAttemptAllowsSeedQuestionAssignedToOwnedSession() {
        UUID userId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        User user = user(userId, "user@example.com");
        Topic topic = topic(UUID.randomUUID());
        Question seedQuestion = question(UUID.randomUUID(), user(UUID.randomUUID(), SeedData.SYSTEM_USER_EMAIL), topic);
        PracticeSession session = PracticeSession.builder()
            .id(sessionId)
            .user(user)
            .topic(topic)
            .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(questionRepository.findById(seedQuestion.getId())).thenReturn(Optional.of(seedQuestion));
        when(practiceSessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(practiceSessionQuestionRepository.findByPracticeSessionIdAndQuestionId(sessionId, seedQuestion.getId()))
            .thenReturn(Optional.of(PracticeSessionQuestion.builder().practiceSession(session).question(seedQuestion).build()));

        service.recordAttempt(userId, new AnswerAttemptRequest(sessionId, seedQuestion.getId(), 0, 15));

        ArgumentCaptor<AnswerAttempt> captor = ArgumentCaptor.forClass(AnswerAttempt.class);
        verify(answerAttemptRepository).save(captor.capture());
        assertEquals(user, captor.getValue().getUser());
        assertEquals(seedQuestion, captor.getValue().getQuestion());
        assertEquals(session, captor.getValue().getPracticeSession());
        assertEquals(true, captor.getValue().isCorrect());
    }

    @Test
    void listMistakeQuestionIdsExcludesQuestionsResolvedByLatestCorrectAttempt() {
        UUID userId = UUID.randomUUID();
        Question question = question(UUID.randomUUID());
        when(answerAttemptRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(
            attempt(question, true, Instant.parse("2026-01-02T00:00:00Z")),
            attempt(question, false, Instant.parse("2026-01-01T00:00:00Z"))
        ));

        assertEquals(List.of(), service.listMistakeQuestionIds(userId));
    }

    @Test
    void listMistakeQuestionIdsKeepsQuestionsWhoseLatestAttemptIsWrong() {
        UUID userId = UUID.randomUUID();
        UUID questionId = UUID.randomUUID();
        Question question = question(questionId);
        when(answerAttemptRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(
            attempt(question, false, Instant.parse("2026-01-02T00:00:00Z")),
            attempt(question, true, Instant.parse("2026-01-01T00:00:00Z"))
        ));

        assertEquals(List.of(questionId), service.listMistakeQuestionIds(userId));
    }

    private AnswerAttempt attempt(Question question, boolean correct, Instant createdAt) {
        return AnswerAttempt.builder()
            .question(question)
            .correct(correct)
            .createdAt(createdAt)
            .build();
    }

    @SuppressWarnings("unchecked")
    private ArgumentCaptor<List<PracticeSessionQuestion>> practiceSessionQuestionListCaptor() {
        return (ArgumentCaptor<List<PracticeSessionQuestion>>) (ArgumentCaptor<?>) ArgumentCaptor.forClass(List.class);
    }

    private Question question(UUID questionId) {
        return question(questionId, user(UUID.randomUUID(), "user@example.com"), topic(UUID.randomUUID()));
    }

    private Question question(UUID questionId, User owner, Topic topic) {
        return Question.builder()
            .id(questionId)
            .owner(owner)
            .topic(topic)
            .text("Question")
            .choices(List.of("A", "B"))
            .correctAnswerIndex(0)
            .difficulty(QuestionDifficulty.EASY)
            .source(QuestionSource.MANUAL)
            .build();
    }

    private User user(UUID userId, String email) {
        return User.builder().id(userId).email(email).passwordHash("hash").fullName("User").build();
    }

    private Topic topic(UUID topicId) {
        return Topic.builder().id(topicId).name("Topic").slug("topic").color("blue").build();
    }
}
