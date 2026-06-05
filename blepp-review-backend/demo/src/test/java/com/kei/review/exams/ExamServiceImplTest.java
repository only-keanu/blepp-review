package com.kei.review.exams;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kei.review.config.SeedData;
import com.kei.review.exams.dto.ExamAnswerRequest;
import com.kei.review.exams.dto.QuestionBankExamSessionRequest;
import com.kei.review.questions.Question;
import com.kei.review.questions.QuestionDifficulty;
import com.kei.review.questions.QuestionRepository;
import com.kei.review.questions.QuestionSource;
import com.kei.review.topics.Topic;
import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Pageable;

class ExamServiceImplTest {
    private MockExamRepository mockExamRepository;
    private ExamSessionRepository examSessionRepository;
    private ExamAnswerRepository examAnswerRepository;
    private ExamFlagRepository examFlagRepository;
    private ExamSessionQuestionRepository examSessionQuestionRepository;
    private QuestionRepository questionRepository;
    private UserRepository userRepository;
    private ExamServiceImpl service;

    @BeforeEach
    void setUp() {
        mockExamRepository = mock(MockExamRepository.class);
        examSessionRepository = mock(ExamSessionRepository.class);
        examAnswerRepository = mock(ExamAnswerRepository.class);
        examFlagRepository = mock(ExamFlagRepository.class);
        examSessionQuestionRepository = mock(ExamSessionQuestionRepository.class);
        questionRepository = mock(QuestionRepository.class);
        userRepository = mock(UserRepository.class);
        service = new ExamServiceImpl(
            mockExamRepository,
            examSessionRepository,
            examAnswerRepository,
            examFlagRepository,
            examSessionQuestionRepository,
            questionRepository,
            userRepository
        );
    }

    @Test
    void recordAnswerSavesAssignedQuestionEvenWhenQuestionOwnerDiffers() {
        UUID userId = UUID.randomUUID();
        UUID questionOwnerId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        UUID questionId = UUID.randomUUID();
        User user = user(userId);
        Question question = question(questionId, questionOwnerId, 2);
        ExamSession session = session(sessionId, user);

        when(examSessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));
        when(examSessionQuestionRepository.findByExamSessionIdAndQuestionId(sessionId, questionId))
            .thenReturn(Optional.of(ExamSessionQuestion.builder().examSession(session).question(question).build()));
        when(examAnswerRepository.findByExamSessionIdAndQuestionId(sessionId, questionId))
            .thenReturn(Optional.empty());
        when(examFlagRepository.findByExamSessionIdAndQuestionId(sessionId, questionId))
            .thenReturn(Optional.empty());

        service.recordAnswer(userId, sessionId, new ExamAnswerRequest(questionId, 2, true));

        ArgumentCaptor<ExamAnswer> answerCaptor = ArgumentCaptor.forClass(ExamAnswer.class);
        verify(examAnswerRepository).save(answerCaptor.capture());
        ExamAnswer savedAnswer = answerCaptor.getValue();
        org.junit.jupiter.api.Assertions.assertEquals(session, savedAnswer.getExamSession());
        org.junit.jupiter.api.Assertions.assertEquals(question, savedAnswer.getQuestion());
        org.junit.jupiter.api.Assertions.assertEquals(2, savedAnswer.getSelectedAnswerIndex());
        org.junit.jupiter.api.Assertions.assertTrue(savedAnswer.isCorrect());

        ArgumentCaptor<ExamFlag> flagCaptor = ArgumentCaptor.forClass(ExamFlag.class);
        verify(examFlagRepository).save(flagCaptor.capture());
        org.junit.jupiter.api.Assertions.assertTrue(flagCaptor.getValue().isFlagged());
    }

    @Test
    void recordAnswerUpdatesExistingAnswerForSameSessionQuestion() {
        UUID userId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        UUID questionId = UUID.randomUUID();
        User user = user(userId);
        Question question = question(questionId, userId, 1);
        ExamSession session = session(sessionId, user);
        ExamAnswer existingAnswer = ExamAnswer.builder()
            .examSession(session)
            .question(question)
            .selectedAnswerIndex(0)
            .correct(false)
            .build();

        when(examSessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));
        when(examSessionQuestionRepository.findByExamSessionIdAndQuestionId(sessionId, questionId))
            .thenReturn(Optional.of(ExamSessionQuestion.builder().examSession(session).question(question).build()));
        when(examAnswerRepository.findByExamSessionIdAndQuestionId(sessionId, questionId))
            .thenReturn(Optional.of(existingAnswer));
        when(examFlagRepository.findByExamSessionIdAndQuestionId(sessionId, questionId))
            .thenReturn(Optional.empty());

        service.recordAnswer(userId, sessionId, new ExamAnswerRequest(questionId, 1, false));

        verify(examAnswerRepository).save(existingAnswer);
        org.junit.jupiter.api.Assertions.assertEquals(1, existingAnswer.getSelectedAnswerIndex());
        org.junit.jupiter.api.Assertions.assertTrue(existingAnswer.isCorrect());
    }

    @Test
    void recordAnswerRejectsQuestionNotInSession() {
        UUID userId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        UUID questionId = UUID.randomUUID();
        User user = user(userId);
        Question question = question(questionId, userId, 0);

        when(examSessionRepository.findById(sessionId)).thenReturn(Optional.of(session(sessionId, user)));
        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));
        when(examSessionQuestionRepository.findByExamSessionIdAndQuestionId(sessionId, questionId))
            .thenReturn(Optional.empty());

        assertThrows(
            IllegalStateException.class,
            () -> service.recordAnswer(userId, sessionId, new ExamAnswerRequest(questionId, 0, false))
        );

        verify(examAnswerRepository, never()).save(any());
        verify(examFlagRepository, never()).save(any());
    }

    @Test
    void recordAnswerRejectsSessionOwnedByDifferentUser() {
        UUID userId = UUID.randomUUID();
        UUID sessionOwnerId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        UUID questionId = UUID.randomUUID();

        when(examSessionRepository.findById(sessionId)).thenReturn(Optional.of(session(sessionId, user(sessionOwnerId))));

        assertThrows(
            IllegalStateException.class,
            () -> service.recordAnswer(userId, sessionId, new ExamAnswerRequest(questionId, 0, false))
        );

        verify(questionRepository, never()).findById(any());
        verify(examAnswerRepository, never()).save(any());
        verify(examFlagRepository, never()).save(any());
    }

    @Test
    void recordAnswerRejectsSubmittedSession() {
        UUID userId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        UUID questionId = UUID.randomUUID();
        ExamSession session = session(sessionId, user(userId));
        session.setSubmittedAt(Instant.now());

        when(examSessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        assertThrows(
            IllegalStateException.class,
            () -> service.recordAnswer(userId, sessionId, new ExamAnswerRequest(questionId, 0, false))
        );

        verify(questionRepository, never()).findById(any());
        verify(examAnswerRepository, never()).save(any());
        verify(examFlagRepository, never()).save(any());
    }

    @Test
    void submitCountsUnansweredQuestionsAndLocksSession() {
        UUID userId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        User user = user(userId);
        ExamSession session = session(sessionId, user);
        session.setStartedAt(Instant.parse("2026-01-01T00:00:00Z"));
        Question correctQuestion = question(UUID.randomUUID(), userId, 1);
        Question unansweredQuestion = question(UUID.randomUUID(), userId, 2);

        when(examSessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(examAnswerRepository.findByExamSessionId(sessionId)).thenReturn(List.of(
            ExamAnswer.builder()
                .examSession(session)
                .question(correctQuestion)
                .selectedAnswerIndex(1)
                .correct(true)
                .build()
        ));
        when(examSessionQuestionRepository.findByExamSessionIdOrderByOrderIndexAsc(sessionId)).thenReturn(List.of(
            ExamSessionQuestion.builder().examSession(session).question(correctQuestion).orderIndex(0).build(),
            ExamSessionQuestion.builder().examSession(session).question(unansweredQuestion).orderIndex(1).build()
        ));

        var response = service.submit(userId, sessionId);

        org.junit.jupiter.api.Assertions.assertEquals(50, response.score());
        org.junit.jupiter.api.Assertions.assertEquals(2, response.totalQuestions());
        org.junit.jupiter.api.Assertions.assertEquals(1, response.correctCount());
        org.junit.jupiter.api.Assertions.assertEquals(1, response.unansweredCount());
        org.junit.jupiter.api.Assertions.assertNotNull(response.timeTakenSeconds());
        org.junit.jupiter.api.Assertions.assertNotNull(session.getSubmittedAt());
        verify(examSessionRepository).save(session);
    }

    @Test
    void submitCustomQuestionBankSessionUsesSessionTotalWhenNoMockExamExists() {
        UUID userId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        User user = user(userId);
        ExamSession session = ExamSession.builder()
            .id(sessionId)
            .user(user)
            .mockExam(null)
            .totalQuestions(2)
            .durationMinutes(30)
            .startedAt(Instant.parse("2026-01-01T00:00:00Z"))
            .build();
        Question correctQuestion = question(UUID.randomUUID(), userId, 1);

        when(examSessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(examAnswerRepository.findByExamSessionId(sessionId)).thenReturn(List.of(
            ExamAnswer.builder()
                .examSession(session)
                .question(correctQuestion)
                .selectedAnswerIndex(1)
                .correct(true)
                .build()
        ));
        when(examSessionQuestionRepository.findByExamSessionIdOrderByOrderIndexAsc(sessionId)).thenReturn(List.of());

        var response = service.submit(userId, sessionId);

        org.junit.jupiter.api.Assertions.assertEquals(50, response.score());
        org.junit.jupiter.api.Assertions.assertEquals(2, response.totalQuestions());
        org.junit.jupiter.api.Assertions.assertEquals(1, response.correctCount());
        org.junit.jupiter.api.Assertions.assertEquals(1, response.unansweredCount());
        verify(examSessionRepository).save(session);
    }

    @Test
    void listRecentSessionsReturnsAllSessionTypesForUser() {
        UUID userId = UUID.randomUUID();
        UUID submittedSessionId = UUID.randomUUID();
        UUID inProgressSessionId = UUID.randomUUID();
        UUID examId = UUID.randomUUID();
        User user = user(userId);
        ExamSession submitted = ExamSession.builder()
            .id(submittedSessionId)
            .user(user)
            .mockExam(MockExam.builder()
                .id(examId)
                .title("General Psychology Mock Exam")
                .totalQuestions(50)
                .durationMinutes(60)
                .build())
            .startedAt(Instant.parse("2026-01-02T00:00:00Z"))
            .submittedAt(Instant.parse("2026-01-02T01:00:00Z"))
            .score(82)
            .timeTakenSeconds(3600)
            .build();
        ExamSession inProgress = ExamSession.builder()
            .id(inProgressSessionId)
            .user(user)
            .mockExam(null)
            .totalQuestions(12)
            .durationMinutes(30)
            .startedAt(Instant.parse("2026-01-03T00:00:00Z"))
            .build();

        when(examSessionRepository.findByUserIdOrderByStartedAtDesc(any(), any()))
            .thenReturn(List.of(inProgress, submitted));
        when(examAnswerRepository.countByExamSessionId(inProgressSessionId)).thenReturn(4L);
        when(examAnswerRepository.countByExamSessionId(submittedSessionId)).thenReturn(50L);

        var sessions = service.listRecentSessions(userId, 5);

        org.junit.jupiter.api.Assertions.assertEquals(2, sessions.size());
        org.junit.jupiter.api.Assertions.assertEquals(inProgressSessionId, sessions.get(0).id());
        org.junit.jupiter.api.Assertions.assertNull(sessions.get(0).examId());
        org.junit.jupiter.api.Assertions.assertEquals("Question Bank Review", sessions.get(0).title());
        org.junit.jupiter.api.Assertions.assertEquals("IN_PROGRESS", sessions.get(0).status());
        org.junit.jupiter.api.Assertions.assertEquals(12, sessions.get(0).totalQuestions());
        org.junit.jupiter.api.Assertions.assertEquals(30, sessions.get(0).durationMinutes());
        org.junit.jupiter.api.Assertions.assertEquals(4L, sessions.get(0).answeredCount());

        org.junit.jupiter.api.Assertions.assertEquals(submittedSessionId, sessions.get(1).id());
        org.junit.jupiter.api.Assertions.assertEquals(examId, sessions.get(1).examId());
        org.junit.jupiter.api.Assertions.assertEquals("General Psychology Mock Exam", sessions.get(1).title());
        org.junit.jupiter.api.Assertions.assertEquals("SUBMITTED", sessions.get(1).status());
        org.junit.jupiter.api.Assertions.assertEquals(82, sessions.get(1).score());
        org.junit.jupiter.api.Assertions.assertEquals(50L, sessions.get(1).answeredCount());

        ArgumentCaptor<UUID> userCaptor = ArgumentCaptor.forClass(UUID.class);
        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(examSessionRepository).findByUserIdOrderByStartedAtDesc(userCaptor.capture(), pageableCaptor.capture());
        org.junit.jupiter.api.Assertions.assertEquals(userId, userCaptor.getValue());
        org.junit.jupiter.api.Assertions.assertEquals(5, pageableCaptor.getValue().getPageSize());
    }

    @Test
    void listRecentSessionsDefaultsAndClampsLimit() {
        UUID userId = UUID.randomUUID();
        when(examSessionRepository.findByUserIdOrderByStartedAtDesc(any(), any())).thenReturn(List.of());

        service.listRecentSessions(userId, null);
        service.listRecentSessions(userId, 99);
        service.listRecentSessions(userId, 0);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(examSessionRepository, times(3)).findByUserIdOrderByStartedAtDesc(any(), pageableCaptor.capture());
        org.junit.jupiter.api.Assertions.assertEquals(10, pageableCaptor.getAllValues().get(0).getPageSize());
        org.junit.jupiter.api.Assertions.assertEquals(20, pageableCaptor.getAllValues().get(1).getPageSize());
        org.junit.jupiter.api.Assertions.assertEquals(1, pageableCaptor.getAllValues().get(2).getPageSize());
    }

    @Test
    void startSessionUsesSeedQuestionsWhenUserHasNoPersonalQuestions() {
        UUID userId = UUID.randomUUID();
        UUID examId = UUID.randomUUID();
        User user = user(userId);
        MockExam exam = MockExam.builder()
            .id(examId)
            .title("Full BLEPP Simulation")
            .totalQuestions(3)
            .build();
        List<Question> seedQuestions = List.of(
            question(UUID.randomUUID(), UUID.randomUUID(), 0),
            question(UUID.randomUUID(), UUID.randomUUID(), 1),
            question(UUID.randomUUID(), UUID.randomUUID(), 2)
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(mockExamRepository.findById(examId)).thenReturn(Optional.of(exam));
        when(examSessionRepository.save(any(ExamSession.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(questionRepository.findByOwnerId(userId)).thenReturn(List.of());
        when(questionRepository.findByOwnerEmail(SeedData.SYSTEM_USER_EMAIL)).thenReturn(seedQuestions);

        service.startSession(userId, examId);

        ArgumentCaptor<List<ExamSessionQuestion>> itemsCaptor = sessionQuestionItemsCaptor();
        verify(examSessionQuestionRepository).saveAll(itemsCaptor.capture());
        org.junit.jupiter.api.Assertions.assertEquals(3, itemsCaptor.getValue().size());
        verify(questionRepository).findByOwnerEmail(SeedData.SYSTEM_USER_EMAIL);
    }

    @Test
    void startSessionFillsRemainingSlotsWithSeedQuestions() {
        UUID userId = UUID.randomUUID();
        UUID examId = UUID.randomUUID();
        UUID topicId = UUID.randomUUID();
        User user = user(userId);
        Topic topic = Topic.builder().id(topicId).name("Ethics").slug("ethics-ra-10029").color("red").build();
        MockExam exam = MockExam.builder()
            .id(examId)
            .title("Ethics and Professional Practice Mock Exam")
            .topic(topic)
            .totalQuestions(3)
            .build();
        Question userQuestion = question(UUID.randomUUID(), userId, topic, 0);
        List<Question> seedQuestions = List.of(
            question(UUID.randomUUID(), UUID.randomUUID(), topic, 1),
            question(UUID.randomUUID(), UUID.randomUUID(), topic, 2)
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(mockExamRepository.findById(examId)).thenReturn(Optional.of(exam));
        when(examSessionRepository.save(any(ExamSession.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(questionRepository.findByOwnerIdAndTopicId(userId, topicId)).thenReturn(List.of(userQuestion));
        when(questionRepository.findByOwnerEmailAndTopicId(SeedData.SYSTEM_USER_EMAIL, topicId)).thenReturn(seedQuestions);

        service.startSession(userId, examId);

        ArgumentCaptor<List<ExamSessionQuestion>> itemsCaptor = sessionQuestionItemsCaptor();
        verify(examSessionQuestionRepository).saveAll(itemsCaptor.capture());
        org.junit.jupiter.api.Assertions.assertEquals(3, itemsCaptor.getValue().size());
        verify(questionRepository).findByOwnerEmailAndTopicId(SeedData.SYSTEM_USER_EMAIL, topicId);
    }

    @Test
    void startSessionDoesNotUseSeedQuestionsWhenUserHasEnoughPersonalQuestions() {
        UUID userId = UUID.randomUUID();
        UUID examId = UUID.randomUUID();
        User user = user(userId);
        MockExam exam = MockExam.builder()
            .id(examId)
            .title("Quick Practice")
            .totalQuestions(2)
            .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(mockExamRepository.findById(examId)).thenReturn(Optional.of(exam));
        when(examSessionRepository.save(any(ExamSession.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(questionRepository.findByOwnerId(userId)).thenReturn(List.of(
            question(UUID.randomUUID(), userId, 0),
            question(UUID.randomUUID(), userId, 1)
        ));

        service.startSession(userId, examId);

        verify(questionRepository, never()).findByOwnerEmail(SeedData.SYSTEM_USER_EMAIL);
        verify(examSessionQuestionRepository, times(1)).saveAll(any());
    }

    @Test
    void startQuestionBankSessionUsesPersonalAndSeedQuestionsAcrossSelectedTopics() {
        UUID userId = UUID.randomUUID();
        UUID topicOneId = UUID.randomUUID();
        UUID topicTwoId = UUID.randomUUID();
        User user = user(userId);
        Topic topicOne = Topic.builder().id(topicOneId).name("General").slug("general-psychology").color("blue").build();
        Topic topicTwo = Topic.builder().id(topicTwoId).name("Ethics").slug("ethics-ra-10029").color("red").build();
        Question personal = question(UUID.randomUUID(), userId, topicOne, 0);
        Question seedOne = question(UUID.randomUUID(), UUID.randomUUID(), topicOne, 1);
        Question seedTwo = question(UUID.randomUUID(), UUID.randomUUID(), topicTwo, 2);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(examSessionRepository.save(any(ExamSession.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(questionRepository.findByOwnerIdAndTopicIdIn(userId, List.of(topicOneId, topicTwoId)))
            .thenReturn(List.of(personal));
        when(questionRepository.findByOwnerEmailAndTopicIdIn(SeedData.SYSTEM_USER_EMAIL, List.of(topicOneId, topicTwoId)))
            .thenReturn(List.of(seedOne, seedTwo));

        var response = service.startQuestionBankSession(
            userId,
            new QuestionBankExamSessionRequest(10, 60, List.of(topicOneId, topicTwoId))
        );

        ArgumentCaptor<ExamSession> sessionCaptor = ArgumentCaptor.forClass(ExamSession.class);
        verify(examSessionRepository, times(1)).save(sessionCaptor.capture());
        org.junit.jupiter.api.Assertions.assertNull(sessionCaptor.getValue().getMockExam());
        org.junit.jupiter.api.Assertions.assertEquals(3, sessionCaptor.getValue().getTotalQuestions());
        org.junit.jupiter.api.Assertions.assertEquals(60, sessionCaptor.getValue().getDurationMinutes());
        org.junit.jupiter.api.Assertions.assertNull(response.examId());
        org.junit.jupiter.api.Assertions.assertEquals(3, response.totalQuestions());
        org.junit.jupiter.api.Assertions.assertEquals(60, response.durationMinutes());

        ArgumentCaptor<List<ExamSessionQuestion>> itemsCaptor = sessionQuestionItemsCaptor();
        verify(examSessionQuestionRepository).saveAll(itemsCaptor.capture());
        org.junit.jupiter.api.Assertions.assertEquals(3, itemsCaptor.getValue().size());
    }

    @Test
    void startQuestionBankSessionUsesAllTopicsWhenNoTopicsSelectedAndCapsAtRequestedCount() {
        UUID userId = UUID.randomUUID();
        User user = user(userId);
        List<Question> personalQuestions = List.of(
            question(UUID.randomUUID(), userId, 0),
            question(UUID.randomUUID(), userId, 1)
        );
        List<Question> seedQuestions = List.of(
            question(UUID.randomUUID(), UUID.randomUUID(), 2),
            question(UUID.randomUUID(), UUID.randomUUID(), 3)
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(examSessionRepository.save(any(ExamSession.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(questionRepository.findByOwnerId(userId)).thenReturn(personalQuestions);
        when(questionRepository.findByOwnerEmail(SeedData.SYSTEM_USER_EMAIL)).thenReturn(seedQuestions);

        var response = service.startQuestionBankSession(
            userId,
            new QuestionBankExamSessionRequest(2, 30, List.of())
        );

        org.junit.jupiter.api.Assertions.assertEquals(2, response.totalQuestions());
        ArgumentCaptor<List<ExamSessionQuestion>> itemsCaptor = sessionQuestionItemsCaptor();
        verify(examSessionQuestionRepository).saveAll(itemsCaptor.capture());
        org.junit.jupiter.api.Assertions.assertEquals(2, itemsCaptor.getValue().size());
    }

    @Test
    void startQuestionBankSessionRejectsEmptyQuestionPool() {
        UUID userId = UUID.randomUUID();
        User user = user(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(questionRepository.findByOwnerId(userId)).thenReturn(List.of());
        when(questionRepository.findByOwnerEmail(SeedData.SYSTEM_USER_EMAIL)).thenReturn(List.of());

        assertThrows(
            IllegalStateException.class,
            () -> service.startQuestionBankSession(userId, new QuestionBankExamSessionRequest(10, 30, List.of()))
        );
        verify(examSessionRepository, never()).save(any());
        verify(examSessionQuestionRepository, never()).saveAll(any());
    }

    private ExamSession session(UUID sessionId, User user) {
        return ExamSession.builder()
            .id(sessionId)
            .user(user)
            .mockExam(MockExam.builder().id(UUID.randomUUID()).totalQuestions(10).build())
            .build();
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private ArgumentCaptor<List<ExamSessionQuestion>> sessionQuestionItemsCaptor() {
        return ArgumentCaptor.forClass((Class) List.class);
    }

    private Question question(UUID questionId, UUID ownerId, int correctAnswerIndex) {
        return question(
            questionId,
            ownerId,
            Topic.builder().id(UUID.randomUUID()).name("Topic").slug("topic").color("blue").build(),
            correctAnswerIndex
        );
    }

    private Question question(UUID questionId, UUID ownerId, Topic topic, int correctAnswerIndex) {
        return Question.builder()
            .id(questionId)
            .owner(user(ownerId))
            .topic(topic)
            .text("Question")
            .choices(List.of("A", "B", "C", "D"))
            .correctAnswerIndex(correctAnswerIndex)
            .difficulty(QuestionDifficulty.EASY)
            .source(QuestionSource.MANUAL)
            .tags(List.of("tag"))
            .build();
    }

    private User user(UUID userId) {
        return User.builder()
            .id(userId)
            .email(userId + "@example.com")
            .passwordHash("hash")
            .fullName("User")
            .build();
    }
}
