package com.kei.review.practice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.kei.review.lessons.LessonCatalog;
import com.kei.review.lessons.LessonProgressRepository;
import com.kei.review.questions.Question;
import com.kei.review.questions.QuestionRepository;
import com.kei.review.topics.Topic;
import com.kei.review.topics.TopicRepository;
import com.kei.review.topics.UserTopicRepository;
import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PracticeServiceImplTest {
    private AnswerAttemptRepository answerAttemptRepository;
    private PracticeServiceImpl service;

    @BeforeEach
    void setUp() {
        answerAttemptRepository = mock(AnswerAttemptRepository.class);
        service = new PracticeServiceImpl(
            mock(PracticeSessionRepository.class),
            answerAttemptRepository,
            mock(TopicRepository.class),
            mock(UserTopicRepository.class),
            mock(UserRepository.class),
            mock(QuestionRepository.class),
            mock(PracticeSessionQuestionRepository.class),
            mock(LessonProgressRepository.class),
            mock(LessonCatalog.class)
        );
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

    private Question question(UUID questionId) {
        return Question.builder()
            .id(questionId)
            .owner(User.builder().id(UUID.randomUUID()).email("user@example.com").passwordHash("hash").fullName("User").build())
            .topic(Topic.builder().id(UUID.randomUUID()).name("Topic").slug("topic").color("blue").build())
            .text("Question")
            .choices(List.of("A", "B"))
            .correctAnswerIndex(0)
            .build();
    }
}
